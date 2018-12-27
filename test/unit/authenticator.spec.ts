'use strict';

import * as chai from 'chai';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import 'mocha';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import * as request from 'request';
import { Context, GET, PassportAuthenticator, Path, POST, PUT, Security, Server, ServiceContext } from '../../src/typescript-rest';

const expect = chai.expect;

@Path('authorization')
@Security()
export class AuthenticatePath {
    @Context
    public context: ServiceContext;

    @GET
    public test(): JwtUser {
        return this.context.request.user;
    }
}

@Path('authorization/with/role')
@Security('ROLE_ADMIN')
export class AuthenticateRole {
    @Context
    public context: ServiceContext;

    @GET
    public test(): JwtUser {
        return this.context.request.user;
    }
}

@Path('authorization/without/role')
@Security('ROLE_NOT_EXISTING')
export class AuthenticateWithoutRole {
    @Context
    public context: ServiceContext;

    @GET
    public test(): JwtUser {
        return this.context.request.user;
    }
}


@Path('/authorization/methods')
export class AuthenticateMethods {
    @Context
    public context: ServiceContext;

    @GET
    @Path('public')
    public test(): string {
        return 'OK';
    }

    @POST
    @Path('profile')
    @Security(['ROLE_ADMIN', 'ROLE_USER'])
    public test3(): JwtUser {
        return this.context.request.user;
    }

    @GET
    @Path('profile')
    public test2(): string {
        return 'OK';
    }

    @PUT
    @Path('profile')
    @Security('ROLE_NOT_EXISTING')
    public test4(): JwtUser {
        return this.context.request.user;
    }
}

describe('Authenticator Tests', () => {
    before(() => {
        return startApi();
    });

    after(function () {
        stopApi();
    });

    describe('Authorization', () => {
        it('should not authorize without header', (done) => {
            request('http://localhost:5674/authorization', (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should not authorize with wrong token', (done) => {
            request('http://localhost:5674/authorization', {
                headers: {
                    'Authorization': 'Bearer xx'
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should authorize with header', (done) => {
            request('http://localhost:5674/authorization', {
                headers: {
                    'Authorization': `Bearer ${generateJwt()}`
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(200);
                expect(JSON.parse(body)).to.contain({ username: 'admin' });
                done();
            });
        });
    });

    describe('Authorization with role', () => {
        it('should not authorize without header', (done) => {
            request('http://localhost:5674/authorization/with/role', (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should not authorize with wrong token', (done) => {
            request('http://localhost:5674/authorization/with/role', {
                headers: {
                    'Authorization': 'Bearer xx'
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should authorize with header', (done) => {
            request('http://localhost:5674/authorization/with/role', {
                headers: {
                    'Authorization': `Bearer ${generateJwt()}`
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(200);
                expect(JSON.parse(body)).to.contain({ username: 'admin' });
                done();
            });
        });
    });

    describe('Authorization without role', () => {
        it('should not authorize without header', (done) => {
            request('http://localhost:5674/authorization/without/role', (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should not authorize with wrong token', (done) => {
            request('http://localhost:5674/authorization/without/role', {
                headers: {
                    'Authorization': 'Bearer xx'
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                expect(body).to.eq('Unauthorized');
                done();
            });
        });
        it('should not authorize with header and without appropiate role', (done) => {
            request('http://localhost:5674/authorization/without/role', {
                headers: {
                    'Authorization': `Bearer ${generateJwt()}`
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(403);
                done();
            });
        });
    });

    describe('Authorization for methods', () => {
        it('should work in "public" methods', (done) => {
            request('http://localhost:5674/authorization/methods/public', (error, response, body) => {
                expect(response.statusCode).to.eq(200);
                expect(body).to.eq('OK');
                done();
            });
        });
        it('should not authorize without header', (done) => {
            request.post('http://localhost:5674/authorization/methods/profile',
                (error, response, body) => {
                    expect(response.statusCode).to.eq(401);
                    done();
                });
        });
        it('should not authorize with wrong token', (done) => {
            request.post('http://localhost:5674/authorization/methods/profile', {
                headers: {
                    'Authorization': 'Bearer xx'
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(401);
                done();
            });
        });
        it('should authorize with header', (done) => {
            request.post('http://localhost:5674/authorization/methods/profile', {
                headers: {
                    'Authorization': `Bearer ${generateJwt()}`
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(200);
                expect(JSON.parse(body)).to.contain({ username: 'admin' });
                done();
            });
        });
        it('should authorize in GET method', (done) => {
            request('http://localhost:5674/authorization/methods/profile', (error, response, body) => {
                expect(response.statusCode).to.eq(200);
                expect(body).to.eq('OK');
                done();
            });
        });
        it('should not authorize in PUT method', (done) => {
            request.put('http://localhost:5674/authorization/methods/profile', {
                headers: {
                    'Authorization': `Bearer ${generateJwt()}`
                }
            }, (error, response, body) => {
                expect(response.statusCode).to.eq(403);
                done();
            });
        });
    });
});

const JWT_SECRET: string = 'some-jwt-secret';

const jwtConfig: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Buffer.from(JWT_SECRET, 'base64'),
};

interface JwtUser {
    username: string;
    roles: Array<string>;
}

interface JwtUserPayload {
    sub: string;
    auth: string;
}

function configureAuthenticator() {
    const strategy = new Strategy(jwtConfig, (payload: JwtUserPayload, done: (a: null, b: JwtUser) => void) => {
        const user: JwtUser = {
            roles: payload.auth.split(','),
            username: payload.sub
        };
        done(null, user);
    });

    Server.registerAuthenticator(new PassportAuthenticator(strategy, {
        deserializeUser: (user: string) => JSON.parse(user),
        serializeUser: (user: JwtUser) => {
            return JSON.stringify(user);
        }
    }));
}

function generateJwt() {
    return jwt.sign({ sub: 'admin', auth: 'ROLE_ADMIN,ROLE_USER' }, Buffer.from(JWT_SECRET, 'base64'), { algorithm: 'HS512' });
}

let server: any;

function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const app: express.Application = express();
        app.set('env', 'test');
        configureAuthenticator();
        Server.buildServices(app, AuthenticatePath, AuthenticateRole,
            AuthenticateWithoutRole, AuthenticateMethods);
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