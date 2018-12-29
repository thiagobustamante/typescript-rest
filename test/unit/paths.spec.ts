'use strict';

import * as chai from 'chai';
import * as express from 'express';
import * as _ from 'lodash';
import 'mocha';
import * as request from 'request';
import { Abstract, Context, GET, HttpMethod, Path, PathParam, PUT, Server, ServiceContext } from '../../src/typescript-rest';
const expect = chai.expect;


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
    private context: ServiceContext;

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
        if (context) {
            return 'superclass_OK_' + id;
        }
        return 'false';
    }

    @Path('overload/:id')
    @PUT
    public testOverloadPut(@PathParam('id') id: string) {
        if (context) {
            return 'superclass_OK_' + id;
        }
        return 'false';
    }
}

describe('Paths Tests', () => {

    before(() => {
        return startApi();
    });

    after(() => {
        stopApi();
    });

    describe('Server', () => {
        it('should provide a catalog containing the exposed paths', (done) => {
            expect(Server.getPaths()).to.include.members(['/pathtest', '/pathtest2',
                '/methodpath', '/pathtest2/secondpath', '/superclasspath/overload/:id']);
            expect(Server.getPaths()).to.not.include.members(['/overload/:id']);
            expect(Server.getHttpMethods('/pathtest')).to.have.members([HttpMethod.GET]);
            expect(Server.getHttpMethods('/pathtest2/secondpath')).to.have.members([HttpMethod.GET]);
            expect(Server.getHttpMethods('/superclasspath/overload/:id')).to.have.members([HttpMethod.GET, HttpMethod.PUT]);
            done();
        });
    });

    describe('Path Annotation', () => {
        it('should configure a path', (done) => {
            request('http://localhost:5674/pathtest', function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });
        it('should configure a path without an initial /', (done) => {
            request('http://localhost:5674/pathtest2', function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });
        it('should be able to build a composed path bwetween class and method', (done) => {
            request('http://localhost:5674/pathtest2/secondpath', function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });
        it('should be able to register services with present only on methods of a class', (done) => {
            request('http://localhost:5674/methodpath', function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });
    });

    describe('SuperClassService', () => {
        it('should return OK when calling a method of its super class', (done) => {
            request('http://localhost:5674/superclasspath/123', function (error, response, body) {
                expect(body).to.eq('OK_' + 123);
                done();
            });
        });

        it('should return OK when calling an overloaded method of its super class', (done) => {
            request('http://localhost:5674/superclasspath/overload/123', function (error, response, body) {
                expect(body).to.eq('superclass_OK_' + 123);
                done();
            });
        });
        it('should return OK when calling an overloaded PUT method of its super class', (done) => {
            request.put('http://localhost:5674/superclasspath/overload/123', function (error, response, body) {
                expect(body).to.eq('superclass_OK_' + 123);
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
        server = app.listen(5674, (err: any) => {
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
