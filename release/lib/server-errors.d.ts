/// <reference path="../../typings/index.d.ts" />
import { RestError } from "./server-types";
export declare class BadRequestError extends RestError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends RestError {
    constructor(message?: string);
}
export declare class ForbidenError extends RestError {
    constructor(message?: string);
}
export declare class NotFoundError extends RestError {
    constructor(message?: string);
}
export declare class MethodNotAllowedError extends RestError {
    constructor(message?: string);
}
export declare class NotAcceptableError extends RestError {
    constructor(message?: string);
}
export declare class ConflictError extends RestError {
    constructor(message?: string);
}
export declare class InternalServerError extends RestError {
    constructor(message?: string);
}
export declare class NotImplementedError extends RestError {
    constructor(message?: string);
}
