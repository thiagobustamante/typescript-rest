/// <reference path="../../typings/index.d.ts" />
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
    preferredMedia: string;
    request: express.Request;
    response: express.Response;
    next: express.NextFunction;
}
export declare abstract class HttpError extends Error {
    statusCode: number;
    message: string;
    constructor(name: string, statusCode: number, message?: string);
}
