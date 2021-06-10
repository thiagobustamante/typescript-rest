import * as _ from 'lodash';
import { Errors } from '../../src/typescript-rest';

describe('Server Errors', () => {

    it('should correct default message for BadRequestError', async () => {
        const error = new Errors.BadRequestError();
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('Bad Request');
    });

    it('should correct default message for UnauthorizedError', async () => {
        const error = new Errors.UnauthorizedError();
        expect(error.statusCode).toEqual(401);
        expect(error.message).toEqual('Unauthorized');
    });

    it('should correct default message for ForbiddenError', async () => {
        const error = new Errors.ForbiddenError();
        expect(error.statusCode).toEqual(403);
        expect(error.message).toEqual('Forbidden');
    });

    it('should correct default message for NotFoundError', async () => {
        const error = new Errors.NotFoundError();
        expect(error.statusCode).toEqual(404);
        expect(error.message).toEqual('Not Found');
    });

    it('should correct default message for MethodNotAllowedError', async () => {
        const error = new Errors.MethodNotAllowedError();
        expect(error.statusCode).toEqual(405);
        expect(error.message).toEqual('Method Not Allowed');
    });

    it('should correct default message for NotAcceptableError', async () => {
        const error = new Errors.NotAcceptableError();
        expect(error.statusCode).toEqual(406);
        expect(error.message).toEqual('Not Acceptable');
    });

    it('should correct default message for ConflictError', async () => {
        const error = new Errors.ConflictError();
        expect(error.statusCode).toEqual(409);
        expect(error.message).toEqual('Conflict');
    });

    it('should correct default message for GoneError', async () => {
        const error = new Errors.GoneError();
        expect(error.statusCode).toEqual(410);
        expect(error.message).toEqual('Gone');
    });

    it('should correct default message for UnsupportedMediaTypeError', async () => {
        const error = new Errors.UnsupportedMediaTypeError();
        expect(error.statusCode).toEqual(415);
        expect(error.message).toEqual('Unsupported Media Type');
    });

    it('should correct default message for UnprocessableEntityError', async () => {
        const error = new Errors.UnprocessableEntityError();
        expect(error.statusCode).toEqual(422);
        expect(error.message).toEqual('Unprocessable Entity');
    });

    it('should correct default message for InternalServerError', async () => {
        const error = new Errors.InternalServerError();
        expect(error.statusCode).toEqual(500);
        expect(error.message).toEqual('Internal Server Error');
    });

    it('should correct default message for NotImplementedError', async () => {
        const error = new Errors.NotImplementedError();
        expect(error.statusCode).toEqual(501);
        expect(error.message).toEqual('Not Implemented');
    });

    it('should support custom message for BadRequestError', async () => {
        const error = new Errors.BadRequestError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for UnauthorizedError', async () => {
        const error = new Errors.UnauthorizedError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for ForbiddenError', async () => {
        const error = new Errors.ForbiddenError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for NotFoundError', async () => {
        const error = new Errors.NotFoundError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for MethodNotAllowedError', async () => {
        const error = new Errors.MethodNotAllowedError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for NotAcceptableError', async () => {
        const error = new Errors.NotAcceptableError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for ConflictError', async () => {
        const error = new Errors.ConflictError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for GoneError', async () => {
        const error = new Errors.GoneError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for UnsupportedMediaTypeError', async () => {
        const error = new Errors.UnsupportedMediaTypeError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for UnprocessableEntityError', async () => {
        const error = new Errors.UnprocessableEntityError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for InternalServerError', async () => {
        const error = new Errors.InternalServerError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });

    it('should support custom message for NotImplementedError', async () => {
        const error = new Errors.NotImplementedError('Custom Message');
        expect(error.message).toEqual('Custom Message');
    });
});