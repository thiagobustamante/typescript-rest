import * as express from 'express';
import * as _ from 'lodash';
import * as request from 'request';
import { Abstract, Context, GET, HttpMethod, Path, PathParam, PUT, Server, ServiceContext } from '../../src/typescript-rest';

@Path('/pathtest')
export class PathTestService {
    @GET
    public test(): string {
        return 'OK';
    }
}
export class PathOnlyOnMethodTestService {
    @GET
    @Path('methodpath')
    public test(): string {
        return 'OK';
    }
}

@Path('pathtest2')
export class SubPathTestService {
    @GET
    public test(): string {
        return 'OK';
    }

    @GET
    @Path('secondpath')
    public test2(): string {
        return 'OK';
    }
}
@Abstract
export abstract class BaseApi {
    @Context
    protected context: ServiceContext;

    @GET
    @Path(':id')
    public testCrudGet(@PathParam('id') id: string) {
        if (this.context) {
            return 'OK_' + id;
        }
        return 'false';
    }

    @Path('overload/:id')
    @GET
    public testOverloadGet(@PathParam('id') id: string) {
        if (this.context) {
            return 'OK_' + id;
        }
        return 'false';
    }

    @PUT
    @Path('overload/:id')
    public testOverloadPut(@PathParam('id') id: string) {
        if (this.context) {
            return 'OK_' + id;
        }
        return 'false';
    }
}
@Path('superclasspath')
export class SuperClassService extends BaseApi {
    @GET
    @Path('overload/:id')
    public testOverloadGet(@PathParam('id') id: string) {
        if (this.context) {
            return 'superclass_OK_' + id;
        }
        return 'false';
    }

    @Path('overload/:id')
    @PUT
    public testOverloadPut(@PathParam('id') id: string) {
        if (this.context) {
            return 'superclass_OK_' + id;
        }
        return 'false';
    }
}

describe('Paths Tests', () => {

    beforeAll(() => {
        return startApi();
    });

    afterAll(() => {
        stopApi();
    });

    describe('Server', () => {
        it('should provide a catalog containing the exposed paths', () => {
            expect(Server.getPaths()).toContain('/pathtest');
            expect(Server.getPaths()).toContain('/pathtest2');
            expect(Server.getPaths()).toContain('/methodpath');
            expect(Server.getPaths()).toContain('/pathtest2/secondpath');
            expect(Server.getPaths()).toContain('/superclasspath/overload/:id');
            expect(Server.getPaths()).toContain('/pathtest');
            expect(Server.getPaths()).not.toContain('/overload/:id');
            expect(Server.getHttpMethods('/pathtest')).toContain(HttpMethod.GET);
            expect(Server.getHttpMethods('/pathtest2/secondpath')).toContain(HttpMethod.GET);
            expect(Server.getHttpMethods('/superclasspath/overload/:id')).toContain(HttpMethod.GET);
            expect(Server.getHttpMethods('/superclasspath/overload/:id')).toContain(HttpMethod.PUT);
        });
    });

    describe('Path Annotation', () => {
        it('should configure a path', (done) => {
            request('http://localhost:5674/pathtest', function (error, response, body) {
                expect(body).toEqual('OK');
                done();
            });
        });
        it('should configure a path without an initial /', (done) => {
            request('http://localhost:5674/pathtest2', function (error, response, body) {
                expect(body).toEqual('OK');
                done();
            });
        });
        it('should be able to build a composed path bwetween class and method', (done) => {
            request('http://localhost:5674/pathtest2/secondpath', function (error, response, body) {
                expect(body).toEqual('OK');
                done();
            });
        });
        it('should be able to register services with present only on methods of a class', (done) => {
            request('http://localhost:5674/methodpath', function (error, response, body) {
                expect(body).toEqual('OK');
                done();
            });
        });
    });

    describe('Service on Subclass', () => {
        it('should return OK when calling a method of its super class', (done) => {
            request('http://localhost:5674/superclasspath/123', function (error, response, body) {
                expect(body).toEqual('OK_' + 123);
                done();
            });
        });

        it('should return OK when calling an overloaded method of its super class', (done) => {
            request('http://localhost:5674/superclasspath/overload/123', function (error, response, body) {
                expect(body).toEqual('superclass_OK_' + 123);
                done();
            });
        });
        it('should return OK when calling an overloaded PUT method of its super class', (done) => {
            request.put('http://localhost:5674/superclasspath/overload/123', function (error, response, body) {
                expect(body).toEqual('superclass_OK_' + 123);
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
        Server.buildServices(app, PathTestService, PathOnlyOnMethodTestService,
            SubPathTestService, SuperClassService);
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
