import * as express from 'express';
import * as _ from 'lodash';
import * as request from 'request';
import {
    Accept, AcceptLanguage, ContextAccept, ContextLanguage, GET,
    Path, POST, PUT, Return, Server
} from '../../src/typescript-rest';

export class Person {
    public id: number;
    public name: string;
    public age: number;
    public salary: number;
    constructor(id: number, name: string, age: number, salary: number = age * 1000) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
}

@Path('/accept')
@AcceptLanguage('en', 'pt-BR')
export class AcceptServiceTest {

    @GET
    public testLanguage(@ContextLanguage language: string): string {
        if (language === 'en') {
            return 'accepted';
        }
        return 'aceito';
    }

    @PUT
    public testLanguageChange(@ContextLanguage language: string): void {
        return;
    }

    @GET
    @AcceptLanguage('fr')
    @Path('fr')
    public testLanguageFr(@ContextLanguage language: string): string {
        if (language === 'fr') {
            return 'OK';
        }
        return 'NOT OK';
    }

    @GET
    @Path('types')
    @Accept('application/json')
    public testAccepts(@ContextAccept type: string): string {
        if (type === 'application/json') {
            return 'accepted';
        }
        return 'not accepted';
    }
}

@Path('/reference')
export class ReferenceServiceTest {
    @Path('accepted')
    @POST
    public testAccepted(p: Person): Promise<Return.RequestAccepted<void>> {
        return new Promise<Return.RequestAccepted<void>>(function (resolve, reject) {
            resolve(new Return.RequestAccepted<void>('' + p.id));
        });
    }

    @Path('moved')
    @POST
    public testMoved(p: Person): Promise<Return.MovedPermanently<void>> {
        return new Promise<Return.MovedPermanently<void>>(function (resolve, reject) {
            resolve(new Return.MovedPermanently<void>('' + p.id));
        });
    }

    @Path('movedtemp')
    @POST
    public testMovedTemp(p: Person): Promise<Return.MovedTemporarily<void>> {
        return new Promise<Return.MovedTemporarily<void>>(function (resolve, reject) {
            resolve(new Return.MovedTemporarily<void>('' + p.id));
        });
    }
}

@Path('async/test')
export class AsyncServiceTest {
    @GET
    public async test() {
        const result = await this.aPromiseMethod();
        return result;
    }

    private aPromiseMethod() {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                resolve('OK');
            }, 10);
        });
    }
}

@Path('othersimplepath')
export class SimpleService {
    @GET
    public test(): string {
        return 'othersimpleservice';
    }
}

describe('Server Tests', () => {

    beforeAll(() => {
        return startApi();
    });

    afterAll(() => {
        stopApi();
    });

    // describe('Server', () => {
    //     it('should provide a catalog containing the exposed paths', (done) => {
    //         expect(Server.getPaths()).to.include.members(['/mypath', '/mypath2/secondpath',
    //             '/asubpath/person/:id', '/headers', '/multi-param', '/context', '/upload',
    //             '/download', '/download/ref', '/accept', '/accept/conflict', '/async/test']);
    //         expect(Server.getHttpMethods('/asubpath/person/:id')).to.have.members([HttpMethod.GET, HttpMethod.PUT]);
    //         expect(Server.getHttpMethods('/mypath2/secondpath')).to.have.members([HttpMethod.GET, HttpMethod.DELETE]);
    //         done();
    //     });
    // });

    describe('Server', () => {
        it('should choose language correctly', (done) => {
            request({
                headers: { 'Accept-Language': 'pt-BR' },
                url: 'http://localhost:5674/accept'
            }, (error, response, body) => {
                expect(body).toEqual('aceito');
                done();
            });
        });

        it('should choose language correctly, when declared on methods', (done) => {
            request({
                headers: { 'Accept-Language': 'fr' },
                url: 'http://localhost:5674/accept/fr'
            }, (error, response, body) => {
                expect(body).toEqual('OK');
                done();
            });
        });

        it('should reject unacceptable languages', (done) => {
            request({
                headers: { 'Accept-Language': 'fr' },
                url: 'http://localhost:5674/accept'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(406);
                done();
            });
        });

        it('should use default language if none specified', (done) => {
            request({
                url: 'http://localhost:5674/accept'
            }, (error, response, body) => {
                expect(body).toEqual('accepted');
                done();
            });
        });

        it('should use default media type if none specified', (done) => {
            request({
                url: 'http://localhost:5674/accept/types'
            }, (error, response, body) => {
                expect(body).toEqual('accepted');
                done();
            });
        });
        it('should reject unacceptable media types', (done) => {
            request({
                headers: { 'Accept': 'text/html' },
                url: 'http://localhost:5674/accept/types'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(406);
                done();
            });
        });

        it('should return 404 when unmapped resources are requested', (done) => {
            request({
                url: 'http://localhost:5674/unmapped/resource'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(404);
                done();
            });
        });

        it('should return 405 when a not supported method is requeted to a mapped resource', (done) => {
            request.post({
                url: 'http://localhost:5674/accept'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(405);
                const allowed: string | Array<string> = response.headers['allow'];
                expect(allowed).toContain('GET');
                expect(allowed).toContain('PUT');
                done();
            });
        });
        it('should support async and await on REST methods', (done) => {
            request('http://localhost:5674/async/test', (error, response, body) => {
                expect(body).toEqual('OK');
                done();
            });
        });
    });

    describe('Services that use referenced types', () => {
        it('should return 202 for POST on path: /accepted', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'person 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/accepted'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(202);
                expect(response.headers['location']).toEqual('123');
                done();
            });
        });

        it('should return 301 for POST on path: /moved', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'person 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/moved'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(301);
                expect(response.headers['location']).toEqual('123');
                done();
            });
        });

        it('should return 302 for POST on path: /movedtemp', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'person 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/movedtemp'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(302);
                expect(response.headers['location']).toEqual('123');
                done();
            });
        });
    });

    describe('Service classes with same name', () => {
        it('should should work when imported via loadServices', (done) => {
            request.get({
                url: 'http://localhost:5674/simplepath'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(200);
                expect(body).toEqual('simpleservice');
                done();
            });
        });
        it('should should work when imported via buildServices', (done) => {
            request.get({
                url: 'http://localhost:5674/othersimplepath'
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(200);
                expect(body).toEqual('othersimpleservice');
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
        // Server.setFileLimits({
        //     fieldSize: 1024 * 1024
        // });
        Server.loadControllers(app, ['test/data/*', '!**/*.yaml'], `${__dirname}/../..`);
        Server.buildServices(app, AcceptServiceTest, ReferenceServiceTest,
            AsyncServiceTest, SimpleService);
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
