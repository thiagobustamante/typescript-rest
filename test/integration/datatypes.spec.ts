'use strict';

import * as chai from 'chai';
import * as express from 'express';
import * as fs from 'fs';
import * as _ from 'lodash';
import 'mocha';
import * as request from 'request';
import { Container } from 'typescript-ioc';
import {
    BodyOptions, Context, ContextNext, ContextRequest,
    ContextResponse, CookieParam, FileParam, FormParam, GET,
    HeaderParam, Param, Path, PathParam, POST, PUT, QueryParam, Return, Server, ServiceContext
} from '../../src/typescript-rest';
const expect = chai.expect;

// tslint:disable:no-unused-expression

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
export interface DataParam {
    param1: string;
    param2: Date;
}

@Path("testparams")
export class TestParamsService {
    @Context
    public context: ServiceContext;

    @HeaderParam('my-header')
    private myHeader: ServiceContext;

    @Path('people/:id')
    @GET
    public getPerson(@PathParam('id') id: number): Promise<Person> {
        return new Promise<Person>(function (resolve, reject) {
            resolve(new Person(id, `This is the person with ID = ${id}`, 35));
        });
    }

    @PUT
    @Path('/people/:id')
    public setPerson(person: Person): string {
        return JSON.stringify(person);
    }

    @POST
    @Path('/people')
    @BodyOptions({ limit: '50b' })
    public addPerson(@ContextRequest req: express.Request, person: Person): Return.NewResource<{ id: number }> {
        return new Return.NewResource<{ id: number }>(req.url + '/' + person.id, { id: person.id });
    }

    @POST
    @Path('/date')
    @BodyOptions({
        reviver: (key: string, value: any) => {
            if (key === 'param2') {
                return new Date(value);
            }
            return value;
        }
    })
    public testData(param: DataParam) {
        if ((param.param2 instanceof Date) && (param.param2.toString() === param.param1)) {
            return 'OK';
        }
        return 'NOT OK';
    }


    @GET
    @Path('/people')
    public getAll(@QueryParam('start') start: number,
        @QueryParam('size') size: number): Array<Person> {
        const result: Array<Person> = new Array<Person>();

        for (let i: number = start; i < (start + size); i++) {
            result.push(new Person(i, `This is the person with ID = ${i}`, 35));
        }
        return result;
    }

    @GET
    @Path('myheader')
    public testMyHeader(): string {
        return 'header: ' + this.myHeader;
    }

    @GET
    @Path('headers')
    public testHeaders(@HeaderParam('my-header') header: string,
        @CookieParam('my-cookie') cookie: string): string {
        return 'cookie: ' + cookie + '|header: ' + header;
    }

    @POST
    @Path('multi-param')
    public testMultiParam(@Param('param') param: string): string {
        return param;
    }

    @GET
    @Path('context')
    public testContext(@QueryParam('q') q: string,
        @ContextRequest req: express.Request,
        @ContextResponse response: express.Response,
        @ContextNext next: express.NextFunction): void {

        if (req && response && next) {
            response.status(201);
            if (q === '123') {
                response.send(true);
            }
            else {
                response.send(false);
            }
        }
    }

    @GET
    @Path('default-query')
    public testDefaultQuery(@QueryParam('limit') limit: number = 20,
        @QueryParam('prefix') prefix: string = 'default',
        @QueryParam('expand') expand: boolean = true): string {
        return `limit:${limit}|prefix:${prefix}|expand:${expand}`;
    }

    @GET
    @Path('optional-query')
    public testOptionalQuery(@QueryParam('limit') limit?: number,
        @QueryParam('prefix') prefix?: string,
        @QueryParam('expand') expand?: boolean): string {
        return `limit:${limit}|prefix:${prefix}|expand:${expand}`;
    }

    @POST
    @Path('upload')
    public testUploadFile(@FileParam('myFile') file: Express.Multer.File,
        @FormParam('myField') myField: string): boolean {
        return (file
            && (_.startsWith(file.buffer.toString(), '\'use strict\';'))
            && (myField === 'my_value'));
    }

    @GET
    @Path('download')
    public testDownloadFile(): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            fs.readFile(__dirname + '/datatypes.spec.ts', (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(new Return.DownloadBinaryData(data, 'application/javascript', 'test-rest.spec.js'));
            });
        });
    }

    @Path('download/ref')
    @GET
    public testDownloadFile2(): Promise<Return.DownloadResource> {
        return new Promise<Return.DownloadResource>((resolve, reject) => {
            resolve(new Return.DownloadResource(__dirname + '/datatypes.spec.ts', 'test-rest.spec.js'));
        });
    }
}

@Path("testreturn")
export class TestReturnService {

    @GET
    @Path('noresponse')
    public testNoResponse() {
        return Return.NoResponse;
    }

    @GET
    @Path('empty')
    public testEmptyObjectResponse() {
        return {};
    }

    @POST
    @Path('/externalmodule')
    public testExternal(@ContextRequest req: express.Request): Return.NewResource<Container> {
        const result = new Return.NewResource<Container>(req.url + '/123');
        result.body = new Container();
        return result;
    }
}

describe('Data Types Tests', () => {

    before(() => {
        return startApi();
    });

    after(() => {
        stopApi();
    });

    describe('Services that handle Objects', () => {
        it('should be able to return Objects as JSON', (done) => {
            request('http://localhost:5674/testparams/people/123', (error, response, body) => {
                const result: Person = JSON.parse(body);
                expect(result.id).to.eq(123);
                done();
            });
        });

        it('should be able to receive parametes as Objects', (done) => {
            const person = new Person(123, 'Person 123', 35);
            request.put({
                body: JSON.stringify(person),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/testparams/people/123'
            }, (error, response, body) => {
                const receivedPerson = JSON.parse(body);
                expect(receivedPerson).to.deep.equals(person);
                done();
            });
        });

        it('should be able to return an array of Objects', (done) => {
            request('http://localhost:5674/testparams/people?start=0&size=3', (error, response, body) => {
                const result: Array<Person> = JSON.parse(body);
                expect(result.length).to.eq(3);
                done();
            });
        });

        it('should be able to receive objects that follow size constraints', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'person', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/testparams/people'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(201);
                expect(response.headers['location']).to.eq('/testparams/people/123');
                const result: Person = JSON.parse(body);
                expect(result.id).to.eq(123);
                done();
            });
        });

        it('should be able to reject objects that do not follow size constraints', (done) => {
            request.post({
                body: JSON.stringify(new Person(123,
                    'this is a very large payload that should be rejected', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/testparams/people'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(413);
                done();
            });
        });

        it('should be able to send a Date into a json object ', (done) => {
            const date = new Date();
            request.post({
                body: {
                    param1: date.toString(),
                    param2: date
                },
                json: true,
                url: 'http://localhost:5674/testparams/date'
            }, (error, response, body) => {
                expect(body).to.eq('OK');
                done();
            });
        });
    });

    describe('A rest Service', () => {
        it('should parse header and cookies correclty', (done) => {
            request({
                headers: { 'my-header': 'header value', 'Cookie': 'my-cookie=cookie value' },
                url: 'http://localhost:5674/testparams/headers'
            }, (error, response, body) => {
                expect(body).to.eq('cookie: cookie value|header: header value');
                done();
            });
        });

        it('should read parameters as class property', (done) => {
            request({
                headers: { 'my-header': 'header value' },
                url: 'http://localhost:5674/testparams/myheader'
            }, (error, response, body) => {
                expect(body).to.eq('header: header value');
                done();
            });
        });

        it('should parse multi param as query param', (done) => {
            request.post({
                url: 'http://localhost:5674/testparams/multi-param?param=myQueryValue'
            }, (error, response, body) => {
                expect(body).to.eq('myQueryValue');
                done();
            });
        });

        it('should parse multi param as form param', (done) => {
            const form = {
                'param': 'formParam'
            };
            request.post({
                'form': form,
                'url': 'http://localhost:5674/testparams/multi-param'
            }, (error, response, body) => {
                expect(body).to.eq('formParam');
                expect(response.statusCode).to.eq(200);
                done();
            });
        });

        it('should accept Context parameters', (done) => {
            request({
                url: 'http://localhost:5674/testparams/context?q=123'
            }, (error, response, body) => {
                expect(body).to.eq('true');
                expect(response.statusCode).to.eq(201);
                done();
            });
        });

        it('should accept file parameters', (done) => {
            const req = request.post('http://localhost:5674/testparams/upload', (error, response, body) => {
                expect(body).to.eq('true');
                expect(response.statusCode).to.eq(200);
                done();
            });
            const form = req.form();
            form.append('myField', 'my_value');
            form.append('myFile', fs.createReadStream(__dirname + '/datatypes.spec.ts'), 'test-rest.spec.ts');
        });

        it('should use sent value for query param that defines a default', (done) => {
            request({
                url: 'http://localhost:5674/testparams/default-query?limit=5&prefix=test&expand=false'
            }, (error, response, body) => {
                expect(body).to.eq('limit:5|prefix:test|expand:false');
                done();
            });
        });

        it('should use provided default value for missing query param', (done) => {
            request({
                url: 'http://localhost:5674/testparams/default-query'
            }, (error, response, body) => {
                expect(body).to.eq('limit:20|prefix:default|expand:true');
                done();
            });
        });

        it('should handle empty string value for default parameter', (done) => {
            request({
                url: 'http://localhost:5674/testparams/default-query?limit=&prefix=&expand='
            }, (error, response, body) => {
                expect(body).to.eq('limit:NaN|prefix:|expand:false');
                done();
            });
        });

        it('should use sent value for optional query param', (done) => {
            request({
                url: 'http://localhost:5674/testparams/optional-query?limit=5&prefix=test&expand=false'
            }, (error, response, body) => {
                expect(body).to.eq('limit:5|prefix:test|expand:false');
                done();
            });
        });

        it('should use undefined as value for missing optional query param', (done) => {
            request({
                url: 'http://localhost:5674/testparams/optional-query'
            }, (error, response, body) => {
                expect(body).to.eq('limit:undefined|prefix:undefined|expand:undefined');
                done();
            });
        });

        it('should handle empty string value for optional parameter', (done) => {
            request({
                url: 'http://localhost:5674/testparams/optional-query?limit=&prefix=&expand='
            }, (error, response, body) => {
                expect(body).to.eq('limit:NaN|prefix:|expand:false');
                done();
            });
        });
    });
    describe('Download Service', () => {
        it('should return a file', (done) => {
            request({
                url: 'http://localhost:5674/testparams/download'
            }, (error, response, body) => {
                expect(response.headers['content-type']).to.eq('application/javascript');
                expect(_.startsWith(body.toString(), '\'use strict\';')).to.eq(true);
                done();
            });
        });
        it('should return a referenced file', (done) => {
            request({
                url: 'http://localhost:5674/testparams/download/ref'
            }, (error, response, body) => {
                expect(_.startsWith(body.toString(), '\'use strict\';')).to.eq(true);
                done();
            });
        });
    });

    describe('No Response Service', () => {
        it('should not send a value when NoResponse is returned', (done) => {
            request({
                url: 'http://localhost:5674/testreturn/noresponse'
            }, (error, response, body) => {
                expect(body).to.eq('handled by middleware');
                done();
            });
        });
        it('should not be handled as an empty object', (done) => {
            request({
                url: 'http://localhost:5674/testreturn/empty'
            }, (error, response, body) => {
                const val = JSON.parse(body);
                expect(val).to.be.empty;
                done();
            });
        });
    });

    describe('NewResource return type', () => {
        it('should handle types referenced from other modules', (done) => {
            request.post({
                url: 'http://localhost:5674/testreturn/externalmodule'
            }, (error, response, body) => {
                expect(response.statusCode).to.be.equal(201);
                expect(response.headers.location).to.be.equal('/testreturn/externalmodule/123');
                done();
            });
        });
    });

    describe('Param Converters', () => {
        it('should intercept parameters', (done) => {
            Server.addParameterConverter((param: Person) => {
                if (param.salary === 424242) {
                    param.salary = 434343;
                }
                return param;
            }, Person);
            const person = new Person(123, 'Person 123', 35, 424242);
            request.put({
                body: JSON.stringify(person),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/testparams/people/123'
            }, (error, response, body) => {
                const receivedPerson = JSON.parse(body);
                expect(receivedPerson.salary).to.equals(434343);
                Server.removeParameterConverter(Person);
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
        Server.buildServices(app, TestParamsService, TestReturnService);
        app.use('/testreturn', (req, res, next) => {
            if (!res.headersSent) {
                res.send('handled by middleware');
            }
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