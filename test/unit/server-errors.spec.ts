'use strict';

import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import { Errors } from '../../src/typescript-rest';

const expect = chai.expect;

// tslint:disable:no-unused-expression
describe('Server Errors', () => {

    it('should correct default message for BadRequestError', () => {
        const error = new Errors.BadRequestError();
        expect(error.statusCode).to.equals(400);
        expect(error.message).to.equals('Bad Request');
    });

    it('should correct default message for UnauthorizedError', () => {
        const error = new Errors.UnauthorizedError();
        expect(error.statusCode).to.equals(401);
        expect(error.message).to.equals('Unauthorized');
    });

    it('should correct default message for ForbiddenError', () => {
        const error = new Errors.ForbiddenError();
        expect(error.statusCode).to.equals(403);
        expect(error.message).to.equals('Forbidden');
    });

    it('should correct default message for NotFoundError', () => {
        const error = new Errors.NotFoundError();
        expect(error.statusCode).to.equals(404);
        expect(error.message).to.equals('Not Found');
    });

    it('should correct default message for MethodNotAllowedError', () => {
        const error = new Errors.MethodNotAllowedError();
        expect(error.statusCode).to.equals(405);
        expect(error.message).to.equals('Method Not Allowed');
    });

    it('should correct default message for NotAcceptableError', () => {
        const error = new Errors.NotAcceptableError();
        expect(error.statusCode).to.equals(406);
        expect(error.message).to.equals('Not Acceptable');
    });

    it('should correct default message for ConflictError', () => {
        const error = new Errors.ConflictError();
        expect(error.statusCode).to.equals(409);
        expect(error.message).to.equals('Conflict');
    });

    it('should correct default message for GoneError', () => {
        const error = new Errors.GoneError();
        expect(error.statusCode).to.equals(410);
        expect(error.message).to.equals('Gone');
    });

    it('should correct default message for UnsupportedMediaTypeError', () => {
        const error = new Errors.UnsupportedMediaTypeError();
        expect(error.statusCode).to.equals(415);
        expect(error.message).to.equals('Unsupported Media Type');
    });

    it('should correct default message for UnprocessableEntityError', () => {
        const error = new Errors.UnprocessableEntityError();
        expect(error.statusCode).to.equals(422);
        expect(error.message).to.equals('Unprocessable Entity');
    });

    it('should correct default message for InternalServerError', () => {
        const error = new Errors.InternalServerError();
        expect(error.statusCode).to.equals(500);
        expect(error.message).to.equals('Internal Server Error');
    });

    it('should correct default message for NotImplementedError', () => {
        const error = new Errors.NotImplementedError();
        expect(error.statusCode).to.equals(501);
        expect(error.message).to.equals('Not Implemented');
    });

    it('should support custom message for BadRequestError', () => {
        const error = new Errors.BadRequestError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for UnauthorizedError', () => {
        const error = new Errors.UnauthorizedError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for ForbiddenError', () => {
        const error = new Errors.ForbiddenError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for NotFoundError', () => {
        const error = new Errors.NotFoundError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for MethodNotAllowedError', () => {
        const error = new Errors.MethodNotAllowedError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for NotAcceptableError', () => {
        const error = new Errors.NotAcceptableError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for ConflictError', () => {
        const error = new Errors.ConflictError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for GoneError', () => {
        const error = new Errors.GoneError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for UnsupportedMediaTypeError', () => {
        const error = new Errors.UnsupportedMediaTypeError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for UnprocessableEntityError', () => {
        const error = new Errors.UnprocessableEntityError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for InternalServerError', () => {
        const error = new Errors.InternalServerError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });

    it('should support custom message for NotImplementedError', () => {
        const error = new Errors.NotImplementedError('Custom Message');
        expect(error.message).to.equals('Custom Message');
    });
});