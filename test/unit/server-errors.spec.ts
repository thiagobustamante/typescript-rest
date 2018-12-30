'use strict';

import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import { Errors } from '../../src/typescript-rest';

const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('Server Errors', () => {

    it('should correct default message for BadRequestError', async () => {
        const error = new Errors.BadRequestError();
        expect(error.statusCode).to.equals(400);
        expect(error.message).to.equals('Bad Request');
    });

    it('should correct default message for UnauthorizedError', async () => {
        const error = new Errors.UnauthorizedError();
        expect(error.statusCode).to.equals(401);
        expect(error.message).to.equals('Unauthorized');
    });

    it('should correct default message for ForbiddenError', async () => {
        const error = new Errors.ForbiddenError();
        expect(error.statusCode).to.equals(403);
        expect(error.message).to.equals('Forbidden');
    });

    it('should correct default message for NotFoundError', async () => {
        const error = new Errors.NotFoundError();
        expect(error.statusCode).to.equals(404);
        expect(error.message).to.equals('Not Found');
    });

    it('should correct default message for MethodNotAllowedError', async () => {
        const error = new Errors.MethodNotAllowedError();
        expect(error.statusCode).to.equals(405);
        expect(error.message).to.equals('Method Not Allowed');
    });

    it('should correct default message for NotAcceptableError', async () => {
        const error = new Errors.NotAcceptableError();
        expect(error.statusCode).to.equals(406);
        expect(error.message).to.equals('Not Acceptable');
    });

    it('should correct default message for ConflictError', async () => {
        const error = new Errors.ConflictError();
        expect(error.statusCode).to.equals(409);
        expect(error.message).to.equals('Conflict');
    });

    it('should correct default message for GoneError', async () => {
        const error = new Errors.GoneError();
        expect(error.statusCode).to.equals(410);
        expect(error.message).to.equals('Gone');
    });

    it('should correct default message for UnsupportedMediaTypeError', async () => {
        const error = new Errors.UnsupportedMediaTypeError();
        expect(error.statusCode).to.equals(415);
        expect(error.message).to.equals('Unsupported Media Type');
    });

    it('should correct default message for UnprocessableEntityError', async () => {
        const error = new Errors.UnprocessableEntityError();
        expect(error.statusCode).to.equals(422);
        expect(error.message).to.equals('Unprocessable Entity');
    });

    it('should correct default message for InternalServerError', async () => {
        const error = new Errors.InternalServerError();
        expect(error.statusCode).to.equals(500);
        expect(error.message).to.equals('Internal Server Error');
    });

    it('should correct default message for NotImplementedError', async () => {
        const error = new Errors.NotImplementedError();
        expect(error.statusCode).to.equals(501);
        expect(error.message).to.equals('Not Implemented');
    });
});