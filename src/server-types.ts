'use strict';

import * as express from 'express';

/**
 * Limits for file uploads
 */
export interface FileLimits {
    /** Max field name size (Default: 100 bytes) */
    fieldNameSize?: number;
    /** Max field value size (Default: 1MB) */
    fieldSize?: number;
    /** Max number of non- file fields (Default: Infinity) */
    fields?: number;
    /** For multipart forms, the max file size (in bytes)(Default: Infinity) */
    fileSize?: number;
    /** For multipart forms, the max number of file fields (Default: Infinity) */
    files?: number;
    /** For multipart forms, the max number of parts (fields + files)(Default: Infinity) */
    parts?: number;
    /** For multipart forms, the max number of header key=> value pairs to parse Default: 2000(same as node's http). */
    headerPairs?: number;
}

/**
 * The supported HTTP methods.
 */
export enum HttpMethod {
    GET = 1,
    POST,
    PUT,
    DELETE,
    HEAD,
    OPTIONS,
    PATCH
}

// FIXME: get better solution
export const HTTP_METHOD_STRING = {
    1: 'get',
    2: 'post',
    3: 'put',
    4: 'delete',
    5: 'head',
    6: 'options',
    7: 'patch'
};

/**
 * Represents the current context of the request being handled.
 */
export class ServiceContext {
    /**
     * The resolved language to be used in the current request handling.
     */
    language: string;
    /**
     * The preferred media type to be used in the current request handling.
     */
    accept: string;
    /**
     * The request object.
     */
    request: express.Request;
    /**
     * The response object
     */
    response: express.Response;
    /**
     * The next function. It can be used to delegate to the next middleware
     * registered the processing of the current request.
     */
    next: express.NextFunction;
}

/**
 * The Base class for all HTTP errors
 */
export abstract class HttpError extends Error {
    constructor(name: string,
        public statusCode: number,
        public message: string) {
        super(message);
        this.name = name;
    }
}

/**
 * Used to create a reference to a resource.
 */
export abstract class ReferencedResource<T> {
    /**
     * Constructor. Receives the location of the resource.
     * @param location To be added to the Location header on response
     * @param statusCode the response status code to be sent
     * @param body the body to be sent
     */
    constructor(public location: string, public statusCode: number, public body?: T) { }
}

/**
 * The factory used to instantiate the object services
 */
export interface ServiceFactory {
    /**
     * Create a new service object. Called before each request handling.
     */
    create: (serviceClass: Function) => any;
    /**
     * Return the type used to handle requests to the target service.
     * By default, returns the serviceClass received, but you can use this
     * to implement IoC integrations.
     */
    getTargetClass: (serviceClass: Function) => FunctionConstructor;
}
