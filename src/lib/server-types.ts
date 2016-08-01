/// <reference path="../../typings/index.d.ts" />
"use strict";

import * as express from "express"; 

/**
 * The supported HTTP methods.
 */
export enum HttpMethod {
	GET,
	POST,
	PUT,
	DELETE,
	HEAD,
	OPTIONS,
	PATCH
}

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
	preferredMedia: string;
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
  			  public message?: string) {
    super(message);
    this.name = name;
    this.stack = (<any> new Error()).stack;
  }
}
