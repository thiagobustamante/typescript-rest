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
export abstract class ReferencedResource {
	/**
	 * Constructor. Receives the location of the resource.
	 * @param location To be added to the Location header on response
	 * @param statusCode the response status code to be sent
	 */
	constructor(public location: string, public statusCode: number) {}
}

