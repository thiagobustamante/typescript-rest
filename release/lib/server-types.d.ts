import * as express from "express";
export declare enum HttpMethod {
    GET = 0,
    POST = 1,
    PUT = 2,
    DELETE = 3,
    HEAD = 4,
    OPTIONS = 5,
    PATCH = 6,
}
export declare class ServiceContext {
    language: string;
    accept: string;
    request: express.Request;
    response: express.Response;
    next: express.NextFunction;
}
export declare abstract class HttpError extends Error {
    statusCode: number;
    message: string;
    constructor(name: string, statusCode: number, message?: string);
}
export declare abstract class ReferencedResource {
    location: string;
    statusCode: number;
    constructor(location: string, statusCode: number);
}
