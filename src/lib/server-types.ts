/// <reference path="../../typings/index.d.ts" />
"use strict";

import * as express from "express"; 

export enum HttpMethod {
	GET,
	POST,
	PUT,
	DELETE,
	HEAD,
	OPTIONS,
	PATCH
}

export class ServiceContext {
	language: string;
	preferredMedia: string;
	request: express.Request;
	response: express.Response; 
	next: express.NextFunction;
}

export abstract class RestError extends Error {
  constructor(name: string, 
  			  public statusCode: number, 
  			  public message?: string) {
    super(message);
    this.name = name;
    this.stack = (<any> new Error()).stack;
  }
}
