/// <reference path="../../typings/index.d.ts" />
"use strict";

import {HttpError} from "./server-types"; 

export class BadRequestError extends HttpError {
	constructor(message?: string) {
		super("BadRequestError", 400, message);
	}
}

export class UnauthorizedError extends HttpError {
	constructor(message?: string) {
		super("UnauthorizedError", 401, message);
	}
}

export class ForbidenError extends HttpError {
	constructor(message?: string) {
		super("ForbidenError", 403, message);
	}
}

export class NotFoundError extends HttpError {
	constructor(message?: string) {
		super("NotFoundError", 404, message);
	}
}

export class MethodNotAllowedError extends HttpError {
	constructor(message?: string) {
		super("MethodNotAllowedError", 405, message);
	}
}

export class NotAcceptableError extends HttpError {
	constructor(message?: string) {
		super("NotAcceptableError", 406, message);
	}
}

export class ConflictError extends HttpError {
	constructor(message?: string) {
		super("ConflictError", 409, message);
	}
}

export class InternalServerError extends HttpError {
	constructor(message?: string) {
		super("InternalServerError", 500, message);
	}
}

export class NotImplementedError extends HttpError {
	constructor(message?: string) {
		super("NotImplementedError", 501, message);
	}
}
