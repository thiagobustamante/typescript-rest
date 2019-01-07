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
    let internalServerStub: sinon.SinonStubbedInstance<any>;
    let Server: any;

    beforeEach(() => {
        internalServerStub = sinon.stub({
            get: () => this,
        });

        internalServerStub.get.returns(internalServerStub);

        Server = proxyquire('../../src/server', {
            './server-container': { InternalServer: internalServerStub }
        }).Server;
    });

    afterEach(() => {
        internalServerStub.get.restore();
    });

    it('should be able to define a custom cookie secret', async () => {
        const secret = 'my-secret';
        Server.setCookiesSecret(secret);

        expect(internalServerStub.get).to.have.been.calledOnce;
        expect(internalServerStub.cookiesSecret).to.be.equal(secret);
    });

    it('should be able to define a custom cookie decoder', async () => {
        const decoder = sinon.stub();
        Server.setCookiesDecoder(decoder);

        expect(internalServerStub.get).to.have.been.calledOnce;
        expect(internalServerStub.cookiesDecoder).to.be.equal(decoder);
    });

    it('should be able to define a custom destination folder for uploaded files', async () => {
        const target = './target-dir';
        Server.setFileDest(target);

        expect(internalServerStub.get).to.have.been.calledOnce;
        expect(internalServerStub.fileDest).to.be.equal(target);
    });

    it('should be able to define a custom filter for uploaded files', async () => {
        const filter = sinon.stub();
        Server.setFileFilter(filter);

        expect(internalServerStub.get).to.have.been.calledOnce;
        expect(internalServerStub.fileFilter).to.be.equal(filter);
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

        expect(internalServerStub.get).to.have.been.calledOnce;
        expect(internalServerStub.fileLimits).to.be.equal(limits);
    });
});