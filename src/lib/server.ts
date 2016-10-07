"use strict";

import * as express from "express"; 
import {InternalServer} from "./server-container"; 
import {HttpMethod} from "./server-types"; 

/**
 * The Http server main class. 
 */
export class Server {
	/**
	 * Create the routes for all classes decorated with our decorators
	 */
	static buildServices(router: express.Router) {
		let iternalServer: InternalServer = new InternalServer(router);
		iternalServer.buildServices();
	}

	/**
	 * Return all paths accepted by the Server
	 */
	static getPaths(): Array<string> {
		return InternalServer.getPaths().asArray();
	}

	/**
	 * Return the set oh HTTP verbs configured for the given path
	 * @param path The path to search HTTP verbs
	 */
	static getHttpMethods(path: string): Array<HttpMethod> {
		return InternalServer.getHttpMethods(path).asArray();
	}

	/**
	 * A string used for signing cookies. This is optional and if not specified, 
	 * will not parse signed cookies.
	 * @param secret the secret used to sign
	 */
	static setCookiesSecret(secret: string) {
		InternalServer.cookiesSecret = secret;
	}

	/**
	 * Specifies a function that will be used to decode a cookie's value. 
	 * This function can be used to decode a previously-encoded cookie value 
	 * into a JavaScript string.
	 * The default function is the global decodeURIComponent, which will decode 
	 * any URL-encoded sequences into their byte representations.
	 * 
	 * NOTE: if an error is thrown from this function, the original, non-decoded 
	 * cookie value will be returned as the cookie's value.
	 * @param decoder The decoder function
	 */
	static setCookiesDecoder(decoder: (val: string) => string) {
		InternalServer.cookiesDecoder = decoder;
	}

	/**
	 * Set where to store the uploaded files
	 * @param dest Destination folder
	 */
	static setFileDest(dest: string) {
		InternalServer.fileDest = dest;
	}

	/**
	 * Set a Function to control which files are accepted to upload
	 * @param filter The filter function
	 */
	static setFileFilter(filter: (req: Express.Request, file: Express.Multer.File, 
					callback: (error: Error, acceptFile: boolean) => void) => void) {
		InternalServer.fileFilter = filter;
	}

	/**
	 * Set the limits of uploaded data
	 * @param limit The data limit
	 */
	static setFileLimits(limit: number) {
		InternalServer.fileLimits = limit;
	}
}
