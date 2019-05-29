'use strict';

import * as chai from 'chai';
import * as express from 'express';
import * as _ from 'lodash';
import 'mocha';
import * as request from 'request';
import { GET, IgnoreNextMiddlewares, Path, Server } from '../../src/typescript-rest';
const expect = chai.expect;

// tslint:disable:no-unused-expression
@Path('/ignoreEndpoint')
export class EndpointTestService {
    @GET
    @Path('/withoutMiddlewares')
    @IgnoreNextMiddlewares
    public test(): string {
        return 'OK';
    }

    @GET
    @Path('/withMiddlewares')
    public testWithAllMiddlewares(): string {
        return 'OK';
    }
}

let middlewareCalled: boolean;
describe('Customized Endpoint Tests', () => {

    before(() => {
        return startApi();
    });

    after(() => {
        stopApi();
    });

    beforeEach(() => {
        middlewareCalled = false;
    });

    describe('@IgnoreNexts Decorator', () => {
        it('should make the server ignore next middlewares (does not call next())', (done) => {
            request('http://localhost:5674/ignoreEndpoint/withoutMiddlewares', (error, response, body) => {
                expect(body).to.eq('OK');
                expect(middlewareCalled).to.be.false;
                done();
            });
        });

        it('should not prevent the server to call next middlewares for sibbling methods', (done) => {
            request('http://localhost:5674/ignoreEndpoint/withMiddlewares', (error, response, body) => {
                expect(body).to.eq('OK');
                expect(middlewareCalled).to.be.true;
                done();
            });
        });
    });

    describe('Server.ignoreNextMiddlewares', () => {
        before(() => {
            Server.ignoreNextMiddlewares(true);
        });

        after(() => {
            Server.ignoreNextMiddlewares(false);
        });

        it('should make the server ignore next middlewares for all services', (done) => {
            request('http://localhost:5674/ignoreEndpoint/withMiddlewares', (error, response, body) => {
                expect(body).to.eq('OK');
                expect(middlewareCalled).to.be.false;
                done();
            });
        });
    });

});

let server: any;
export function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const app: express.Application = express();
        app.set('env', 'test');
        Server.buildServices(app, EndpointTestService);

        app.use((req, res, next) => {
            middlewareCalled = true;
            next();
        });
        server = app.listen(5674, (err?: any) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export function stopApi() {
    if (server) {
        server.close();
    }
}
