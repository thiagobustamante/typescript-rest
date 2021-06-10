import * as express from 'express';
import * as _ from 'lodash';
import * as request from 'request';
import { Path, POST, PostProcessor, Server } from '../../src/typescript-rest';

@Path('postprocessor')
@PostProcessor(postprocessor1)
export class PostProcessedService {
    @Path('test')
    @POST
    @PostProcessor(postprocessor2)
    public test() {
        return 'OK';
    }

    @Path('asynctest')
    @POST
    @PostProcessor(asyncPostprocessor1)
    @PostProcessor(asyncPostprocessor2) // multiple postprocessors needed to test async
    public asynctest() {
        return 'OK';
    }
}

function postprocessor1(req: express.Request, res: express.Response) {
    res.setHeader('x-postprocessor1', '1');
}

function postprocessor2(req: express.Request, res: express.Response) {
    res.setHeader('x-postprocessor2', '1');
}

async function asyncPostprocessor1(req: express.Request, res: express.Response) {
    res.setHeader('x-asyncpostprocessor1', '1');
}

async function asyncPostprocessor2(req: express.Request, res: express.Response) {
    res.setHeader('x-asyncpostprocessor2', '1');
}

describe('Postprocessor Tests', () => {

    beforeAll(() => {
        return startApi();
    });

    afterAll(() => {
        stopApi();
    });

    describe('Synchronous Postrocessors', () => {
        it('should run after handling the request', (done) => {
            request.post({
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/postprocessor/test'
            }, (error, response, body) => {
                expect(response.headers['x-postprocessor1']).toEqual('1');
                expect(response.headers['x-postprocessor2']).toEqual('1');
                done();
            });
        });
    });

    describe('Assynchronous Postprocessors', () => {
        it('should run after handling the request', (done) => {
            request.post({
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/postprocessor/asynctest'
            }, (error, response, body) => {
                expect(response.headers['x-postprocessor1']).toEqual('1');
                expect(response.headers['x-asyncpostprocessor1']).toEqual('1');
                expect(response.headers['x-asyncpostprocessor2']).toEqual('1');
                done();
            });
        });
    });
});

let server: any;

function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const app: express.Application = express();
        app.set('env', 'test');
        Server.buildServices(app, PostProcessedService);
        server = app.listen(5674, (err?: any) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function stopApi() {
    if (server) {
        server.close();
    }
}