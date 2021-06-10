import * as express from 'express';
import * as _ from 'lodash';
import * as request from 'request';
import { Errors, GET, Path, Server } from '../../src/typescript-rest';

@Path('errors')
export class ErrorService {
    @Path('badrequest')
    @GET
    public test1(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.BadRequestError());
        });
    }

    @Path('conflict')
    @GET
    public test2(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.ConflictError());
        });
    }

    @Path('forbiden')
    @GET
    public test3(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.ForbiddenError());
        });
    }

    @Path('gone')
    @GET
    public test4(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.GoneError());
        });
    }

    @Path('internal')
    @GET
    public test5(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.InternalServerError());
        });
    }

    @Path('method')
    @GET
    public test6(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.MethodNotAllowedError());
        });
    }

    @Path('notacceptable')
    @GET
    public test7(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.NotAcceptableError());
        });
    }

    @Path('notfound')
    @GET
    public test8(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.NotFoundError());
        });
    }

    @Path('notimplemented')
    @GET
    public test9(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.NotImplementedError());
        });
    }

    @Path('unauthorized')
    @GET
    public test10(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.UnauthorizedError());
        });
    }

    @Path('unsupportedmedia')
    @GET
    public test11(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.UnsupportedMediaTypeError());
        });
    }

    @Path('unprocessableentity')
    @GET
    public test12(p: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            reject(new Errors.UnprocessableEntityError());
        });
    }

    @GET
    @Path('sync/badrequest')
    public test13(p: string): Promise<string> {
        throw new Errors.BadRequestError();
    }
}

describe('Errors Tests', () => {

    beforeAll(() => {
        return startApi();
    });

    afterAll(() => {
        stopApi();
    });

    describe('Error Service', () => {
        it('should be able to send 400', (done) => {
            request.get('http://localhost:5674/errors/badrequest', (error, response, body) => {
                expect(response.statusCode).toEqual(400);
                done();
            });
        });
        it('should be able to send 400', (done) => {
            request.get('http://localhost:5674/errors/sync/badrequest', (error, response, body) => {
                expect(response.statusCode).toEqual(400);
                done();
            });
        });
        it('should be able to send 409', (done) => {
            request.get('http://localhost:5674/errors/conflict', (error, response, body) => {
                expect(response.statusCode).toEqual(409);
                done();
            });
        });
        it('should be able to send 403', (done) => {
            request.get('http://localhost:5674/errors/forbiden', (error, response, body) => {
                expect(response.statusCode).toEqual(403);
                done();
            });
        });
        it('should be able to send 410', (done) => {
            request.get('http://localhost:5674/errors/gone', (error, response, body) => {
                expect(response.statusCode).toEqual(410);
                done();
            });
        });
        it('should be able to send 500', (done) => {
            request.get('http://localhost:5674/errors/internal', (error, response, body) => {
                expect(response.statusCode).toEqual(500);
                done();
            });
        });
        it('should be able to send 405', (done) => {
            request.get('http://localhost:5674/errors/method', (error, response, body) => {
                expect(response.statusCode).toEqual(405);
                done();
            });
        });
        it('should be able to send 406', (done) => {
            request.get('http://localhost:5674/errors/notacceptable', (error, response, body) => {
                expect(response.statusCode).toEqual(406);
                done();
            });
        });
        it('should be able to send 404', (done) => {
            request.get('http://localhost:5674/errors/notfound', (error, response, body) => {
                expect(response.statusCode).toEqual(404);
                done();
            });
        });
        it('should be able to send 501', (done) => {
            request.get('http://localhost:5674/errors/notimplemented', (error, response, body) => {
                expect(response.statusCode).toEqual(501);
                done();
            });
        });
        it('should be able to send 401', (done) => {
            request.get('http://localhost:5674/errors/unauthorized', (error, response, body) => {
                expect(response.statusCode).toEqual(401);
                done();
            });
        });
        it('should be able to send 415', (done) => {
            request.get('http://localhost:5674/errors/unsupportedmedia', (error, response, body) => {
                expect(response.statusCode).toEqual(415);
                done();
            });
        });

        it('should be able to send 422', (done) => {
            request.get('http://localhost:5674/errors/unprocessableentity', (error, response, body) => {
                expect(response.statusCode).toEqual(422);
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
        Server.buildServices(app, ErrorService);
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
