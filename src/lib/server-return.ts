"use strict";

import {ReferencedResource} from "./server-types"; 

/**
 * Inform that a new resource was created. Server will 
 * add a Location header and set status to 201
 */
export class NewResource extends ReferencedResource {
	/**
	 * Constructor. Receives the location of the new resource created.
	 * @param location To be added to the Location header on response
	 * @param body To be added to the response body
	 */
	constructor(location: string, body?: any) {
		super(location, 201, body);
	}
}

/**
 * Inform that the request was accepted but is not completed.
 * A Location header should inform the location where the user
 * can monitor his request processing status.
 */
export class RequestAccepted extends ReferencedResource {
	/**
	 * Constructor. Receives the location where information about the 
	 * request processing can be found.
	 * @param location To be added to the Location header on response
	 * @param body To be added to the response body
	 */
	constructor(location: string, body?: any) {
		super(location, 202, body);
	}
}

/**
 * Inform that the resource has permanently
 * moved to a new location, and that future references should use a
 * new URI with their requests.
 */
export class MovedPermanently extends ReferencedResource {
	/**
	 * Constructor. Receives the location where the resource can be found.
	 * @param location To be added to the Location header on response
	 * @param body To be added to the response body
	 */
	constructor(location: string, body?: any) {
		super(location, 301, body);
	}
}

/**
 * Inform that the resource has temporarily
 * moved to another location, but that future references should
 * still use the original URI to access the resource.
 */
export class MovedTemporarily extends ReferencedResource {
	/**
	 * Constructor. Receives the location where the resource can be found.
	 * @param location To be added to the Location header on response
	 * @param body To be added to the response body
	 */
	constructor(location: string, body?: any) {
		super(location, 302, body);
	}
}

/**
 * Used to download a resource.
 */
export class DownloadResource {
	/**
	 * Constructor. 
	 * @param filePath The file path to download.
	 * @param fileName The file name
	 */
	constructor(public filePath: string, public fileName: string) {}
}

/**
 * Used to download binary data as a file.
 */
export class DownloadBinaryData {
	/**
	 * Constructor. Receives the location of the resource.
	 * @param content The binary data to be downloaded as a file.
	 * @param mimeType The mime-type to be passed on Content-Type header.
	 * @param fileName The file name
	 */
	constructor(public content: Buffer, public mimeType: string, public fileName: string) {}
}
