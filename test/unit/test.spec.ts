'use strict';
/* tslint:disable */
import 'mocha';
import * as express from 'express';
import { Person } from '../data/apis';
import * as request from 'request';
import * as _ from 'lodash';
import * as chai from 'chai';
import { Server } from '../../src/typescript-rest';
const expect = chai.expect;

let server: any;

export function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let app: express.Application = express();
        app.set('env', 'test');
        Server.setFileLimits({
            fieldSize: 1024 * 1024
        });
        Server.loadControllers(app, ['test/data/*', '!**/*.yaml'], `${__dirname}/../..`);
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
describe('Server Tests', () => {

    before(() => {
        return startApi();
    });

    after(function () {
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

    describe('AcceptTest', () => {
        it('should choose language correctly', (done) => {
            request({
                headers: { 'Accept-Language': 'pt-BR' },
                url: 'http://localhost:5674/accept'
            }, function (error, response, body) {
                expect(body).to.eq('aceito');
                done();
            });
        });

        it('should choose language correctly, when declared on methods', (done) => {
            request({
                headers: { 'Accept-Language': 'fr' },
                url: 'http://localhost:5674/accept/fr'
            }, function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });

        it('should reject unacceptable languages', (done) => {
            request({
                headers: { 'Accept-Language': 'fr' },
                url: 'http://localhost:5674/accept'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(406);
                done();
            });
        });

        it('should use default language if none specified', (done) => {
            request({
                url: 'http://localhost:5674/accept'
            }, function (error, response, body) {
                expect(body).to.eq('accepted');
                done();
            });
        });

        it('should use default media type if none specified', (done) => {
            request({
                url: 'http://localhost:5674/accept/types'
            }, function (error, response, body) {
                expect(body).to.eq('accepted');
                done();
            });
        });
        it('should handle RestErrors', (done) => {
            request.put({
                headers: { 'Accept': 'text/html' },
                url: 'http://localhost:5674/accept/conflict',
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(409);
                done();
            });
        });
        it('should handle RestErrors on Async calls', (done) => {
            request.post({
                headers: { 'Accept': 'text/html' },
                url: 'http://localhost:5674/accept/conflict',
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(409);
                done();
            });
        });
        it('should reject unacceptable media types', (done) => {
            request({
                headers: { 'Accept': 'text/html' },
                url: 'http://localhost:5674/accept/types'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(406);
                done();
            });
        });

    });

    describe('Server', () => {
        it('should return 404 when unmapped resources are requested', (done) => {
            request({
                url: 'http://localhost:5674/unmapped/resource'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(404);
                done();
            });
        });

        it('should return 405 when a not supported method is requeted to a mapped resource', (done) => {
            request.post({
                url: 'http://localhost:5674/asubpath/person/123'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(405);
                const allowed: string | string[] = response.headers['allow'];
                expect(allowed).to.contain('GET');
                expect(allowed).to.contain('PUT');
                done();
            });
        });
    });

    describe('DateTest', () => {
        it('should be able to send a Date into a json object ', (done) => {
            const date = new Date();
            request.post({
                body: {
                    param1: date.toString(),
                    param2: date
                },
                json: true,
                url: 'http://localhost:5674/dateTest'
            }, function (error, response, body) {
                expect(body).to.eq('OK');
                done();
            });
        });
    });

    describe('ReferenceService', () => {
        it('should return 202 for POST on path: /accepted', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'Fulano de Tal número 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/accepted'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(202);
                expect(response.headers['location']).to.eq('123');
                done();
            });
        });

        it('should return 301 for POST on path: /moved', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'Fulano de Tal número 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/moved'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(301);
                expect(response.headers['location']).to.eq('123');
                done();
            });
        });

        it('should return 302 for POST on path: /movedtemp', (done) => {
            request.post({
                body: JSON.stringify(new Person(123, 'Fulano de Tal número 123', 35)),
                headers: { 'content-type': 'application/json' },
                url: 'http://localhost:5674/reference/movedtemp'
            }, function (error, response, body) {
                expect(response.statusCode).to.eq(302);
                expect(response.headers['location']).to.eq('123');
                done();
            });
        });
    });

    describe('SuperClassService', () => {
        it('should return OK when calling a method of its super class', (done) => {
            request('http://localhost:5674/superclass/123', function (error, response, body) {
                expect(body).to.eq('OK_' + 123);
                done();
            });
        });

        it('should return OK when calling an overloaded method of its super class', (done) => {
            request('http://localhost:5674/superclass/overload/123', function (error, response, body) {
                expect(body).to.eq('superclass_OK_' + 123);
                done();
            });
        });
        it('should return OK when calling an overloaded PUT method of its super class', (done) => {
            request.put('http://localhost:5674/superclass/overload/123', function (error, response, body) {
                expect(body).to.eq('superclass_OK_' + 123);
                done();
            });
        });
    });

    describe('MyAsyncService', () => {
        it('should support async and await on REST methods', (done) => {
            request('http://localhost:5674/async/test', (error, response, body) => {
                expect(body).to.eq('OK');
                done();
            });
        });
    });
});

