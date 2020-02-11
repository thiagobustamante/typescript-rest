'use strict';

import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('Server', () => {
    let serverContainerStub: sinon.SinonStubbedInstance<any>;
    let Server: any;

    beforeEach(() => {
        serverContainerStub = sinon.stub({
            get: () => this,
        });

        serverContainerStub.get.returns(serverContainerStub);

        Server = proxyquire('../../src/server/server', {
            './server-container': { ServerContainer: serverContainerStub }
        }).Server;
    });

    afterEach(() => {
        serverContainerStub.get.restore();
        Server.immutable(false);
    });

    it('should be able to define a custom cookie secret', async () => {
        const secret = 'my-secret';
        Server.setCookiesSecret(secret);

        expect(serverContainerStub.get).to.have.been.calledOnce;
        expect(serverContainerStub.cookiesSecret).to.be.equal(secret);
    });

    it('should be able to define a custom cookie decoder', async () => {
        const decoder = sinon.stub();
        Server.setCookiesDecoder(decoder);

        expect(serverContainerStub.get).to.have.been.calledOnce;
        expect(serverContainerStub.cookiesDecoder).to.be.equal(decoder);
    });

    it('should be able to define a custom destination folder for uploaded files', async () => {
        const target = './target-dir';
        Server.setFileDest(target);

        expect(serverContainerStub.get).to.have.been.calledOnce;
        expect(serverContainerStub.fileDest).to.be.equal(target);
    });

    it('should be able to define a custom filter for uploaded files', async () => {
        const filter = sinon.stub();
        Server.setFileFilter(filter);

        expect(serverContainerStub.get).to.have.been.calledOnce;
        expect(serverContainerStub.fileFilter).to.be.equal(filter);
    });

    it('should be able to define a custom limit for uploaded files', async () => {
        const limits = {
            fieldNameSize: 100,
            fieldSize: 1024,
            fields: 3000,
            fileSize: 3000,
            files: 1000,
            headerPairs: 30,
            parts: 100
        };
        Server.setFileLimits(limits);

        expect(serverContainerStub.get).to.have.been.calledOnce;
        expect(serverContainerStub.fileLimits).to.be.equal(limits);
    });


    it('should ignore change requests when immutable', async () => {
        Server.immutable(true);
        Server.setCookiesSecret(null);
        Server.registerAuthenticator(null);
        Server.registerServiceFactory('test');
        Server.setCookiesDecoder(null);
        Server.setFileDest('test');
        Server.setFileFilter(null);
        Server.setFileLimits(null);
        Server.addParameterConverter(null, null);
        Server.removeParameterConverter(null);
        Server.ignoreNextMiddlewares(false);
        expect(serverContainerStub.get).to.not.have.been.called;
    });

});