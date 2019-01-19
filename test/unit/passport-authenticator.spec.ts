'use strict';

import * as chai from 'chai';
import { RequestHandler } from 'express-serve-static-core';
import * as _ from 'lodash';
import 'mocha';
import { AuthenticateOptions, Strategy } from 'passport';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { wait } from 'test-wait';

chai.use(sinonChai);
const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('PassportAuthenticator', () => {
    const testStrategy = { name: 'test-strategy' };
    let passportStub: sinon.SinonStubbedInstance<any>;
    let PassportAuthenticator: any;
    let authenticator: sinon.SinonStub;
    let expressStub: sinon.SinonStubbedInstance<any>;
    let initializer: sinon.SinonStub;
    let sessionHandler: sinon.SinonStub;

    beforeEach(() => {
        authenticator = sinon.stub();
        initializer = sinon.stub();
        sessionHandler = sinon.stub();

        expressStub = sinon.stub({
            use: (...handlers: Array<RequestHandler>) => this
        });

        passportStub = sinon.stub({
            authenticate: (strategy: string | Array<string>, options: AuthenticateOptions,
                callback?: (...args: Array<any>) => any) => true,
            deserializeUser: (user: string, done: (a: any, b: any) => void) => this,
            initialize: () => this,
            serializeUser: (user: any, done: (a: any, b: string) => void) => this,
            session: () => this,
            use: (name: string, strategy: Strategy) => this
        });

        passportStub.authenticate.returns(authenticator);
        passportStub.initialize.returns(initializer);
        passportStub.session.returns(sessionHandler);

        PassportAuthenticator = proxyquire('../../src/authenticator/passport', {
            'passport': passportStub
        }).PassportAuthenticator;
    });

    afterEach(() => {
        passportStub.authenticate.restore();
        passportStub.deserializeUser.restore();
        passportStub.initialize.restore();
        passportStub.serializeUser.restore();
        passportStub.session.restore();
        passportStub.use.restore();
        expressStub.use.restore();
    });

    it('should be able to create a simple authenticator with a given passport strategy', async () => {
        const auth = new PassportAuthenticator(testStrategy);

        expect(auth.options).to.be.empty;
        expect(passportStub.use).to.have.been.calledOnceWithExactly(testStrategy.name, testStrategy);
        expect(passportStub.authenticate).to.have.been
            .calledOnceWithExactly(testStrategy.name, sinon.match.any);
        expect(auth.getMiddleware()).to.be.equal(authenticator);
    });

    it('should be able to create a simple authenticator with default strategy name', async () => {
        const strategy = {};
        new PassportAuthenticator(strategy);

        expect(passportStub.use).to.have.been.calledOnceWithExactly('default_strategy', strategy);
        expect(passportStub.authenticate).to.have.been
            .calledOnceWithExactly('default_strategy', sinon.match.any);
    });

    it('should be able to create a simple authenticator with custom auth options', async () => {
        const options = {
            authOptions: {
                session: false
            },
            strategyName: 'my-custom-strategy'
        };
        const auth = new PassportAuthenticator(testStrategy, options);

        expect(auth.options).to.be.equal(options);
        expect(passportStub.authenticate).to.have.been
            .calledOnceWithExactly(options.strategyName, options.authOptions);
    });

    it('should be able to initialize a sessionless authenticator', async () => {
        const options = {
            authOptions: {
                session: false
            }
        };
        const auth = new PassportAuthenticator(testStrategy, options);
        auth.initialize(expressStub);

        expect(passportStub.initialize).to.have.been.calledOnce;
        expect(expressStub.use).to.have.been.calledOnceWithExactly(initializer);
        expect(passportStub.session).to.not.have.been.called;
    });

    describe('Session tests', () => {
        let serializeUser: sinon.SinonStub;
        let serializationCallbackStub: sinon.SinonStub;
        let deserializationCallbackStub: sinon.SinonStub;
        let deserializeUser: sinon.SinonStub;
        let options: any;

        beforeEach(() => {
            serializeUser = sinon.stub();
            serializationCallbackStub = sinon.stub();
            deserializationCallbackStub = sinon.stub();
            deserializeUser = sinon.stub();
            options = {
                deserializeUser: deserializeUser,
                serializeUser: serializeUser
            };
        });

        it('should be able to initialize an authenticator with session', async () => {
            const user = { 'id': '123', 'name': 'Joe' };
            const serialization = JSON.stringify(user);
            serializeUser.returns(serialization);
            deserializeUser.returns(user);

            passportStub.serializeUser.yields(user, serializationCallbackStub);
            passportStub.deserializeUser.yields(serialization, deserializationCallbackStub);
            const auth = new PassportAuthenticator(testStrategy, options);
            auth.initialize(expressStub);
            await wait(1);
            expect(passportStub.initialize).to.have.been.calledOnce;
            expect(expressStub.use).to.have.been.calledTwice;
            expect(expressStub.use).to.have.been.calledWithExactly(initializer);
            expect(passportStub.session).to.have.been.calledOnce;
            expect(expressStub.use).to.have.been.calledWithExactly(sessionHandler);
            expect(passportStub.serializeUser).to.have.been.calledOnce;
            expect(passportStub.deserializeUser).to.have.been.calledOnce;
            expect(serializationCallbackStub).to.have.been.calledOnceWithExactly(null, serialization);
            expect(deserializationCallbackStub).to.have.been.calledOnceWithExactly(null, user);
        });

        it('should be able to fail when serialization fail', async () => {
            const user = { 'id': '123', 'name': 'Joe' };
            const serialization = JSON.stringify(user);
            const error = new Error('any error');
            serializeUser.returns(Promise.reject(error));
            deserializeUser.returns(Promise.reject(error));

            passportStub.serializeUser.yields(user, serializationCallbackStub);
            passportStub.deserializeUser.yields(serialization, deserializationCallbackStub);
            const auth = new PassportAuthenticator(testStrategy, options);
            auth.initialize(expressStub);
            await wait(1);
            expect(serializationCallbackStub).to.have.been.calledOnceWithExactly(error, null);
            expect(deserializationCallbackStub).to.have.been.calledOnceWithExactly(error, null);
        });
    });

});