import { HttpError } from "./server-types";
export declare class BadRequestError extends HttpError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends HttpError {
    constructor(message?: string);
}
export declare class ForbidenError extends HttpError {
    constructor(message?: string);
}
export declare class NotFoundError extends HttpError {
    constructor(message?: string);
}
export declare class MethodNotAllowedError extends HttpError {
    constructor(message?: string);
}
export declare class NotAcceptableError extends HttpError {
    constructor(message?: string);
}
export declare class ConflictError extends HttpError {
    constructor(message?: string);
}
export declare class GoneError extends HttpError {
    constructor(message?: string);
}
export declare class UnsupportedMediaTypeError extends HttpError {
    constructor(message?: string);
}
export declare class InternalServerError extends HttpError {
    constructor(message?: string);
}
export declare class NotImplementedError extends HttpError {
    constructor(message?: string);
}
