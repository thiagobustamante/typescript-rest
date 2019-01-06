'use strict';

import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import { AuthenticateOptions, Strategy } from 'passport';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('PassportAuthenticator', () => {
    const testStrategy = { name: 'test-strategy' };
    let passportStub: sinon.SinonStubbedInstance<any>;
    let PassportAuthenticator: any;
    let authenticator: sinon.SinonStub;

    beforeEach(() => {
        authenticator = sinon.stub();

        passportStub = sinon.stub({
            authenticate: (strategy: string | Array<string>, options: AuthenticateOptions,
                callback?: (...args: Array<any>) => any) => true,
            use: (name: string, strategy: Strategy) => this
        });

        passportStub.authenticate.returns(authenticator);

        PassportAuthenticator = proxyquire('../../src/passport-authenticator', {
            'passport': passportStub
        }).PassportAuthenticator;
    });

    afterEach(() => {
        passportStub.authenticate.restore();
        passportStub.use.restore();
    });

    it('should be able to create a simple authenticator with a given passport strategy', async () => {

        const auth = new PassportAuthenticator(testStrategy);

        expect(auth.options).to.be.empty;
        expect(passportStub.use).to.have.been.calledOnceWithExactly(testStrategy.name, testStrategy);
        expect(passportStub.authenticate).to.have.been
            .calledOnceWithExactly(testStrategy.name, sinon.match.any);
        expect(auth.getMiddleware()).to.be.equal(authenticator);
    });
});