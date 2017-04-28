'use strict';

import * as express from 'express';
import 'multer';
import { InternalServer } from './server-container';
import { HttpMethod, ServiceFactory } from './server-types';

/**
 * The Http server main class.
 */
export class Server {
	/**
	 * Create the routes for all classes decorated with our decorators
	 */
    static buildServices(router: express.Router, ...types: any[]) {
        const iternalServer: InternalServer = new InternalServer(router);
        iternalServer.buildServices(types);
    }

	/**
	 * Return all paths accepted by the Server
	 */
    static getPaths(): Array<string> {
        const result = new Array<string>();
        InternalServer.getPaths().forEach(value => {
            result.push(value);
        });

        return result;
    }

	/**
	 * Register a custom serviceFactory. It will be used to instantiate the service Objects
	 * If You plan to use a custom serviceFactory, You must ensure to call this method before any typescript-rest service declaration.
	 */
    static registerServiceFactory(serviceFactory: ServiceFactory) {
        InternalServer.serviceFactory = serviceFactory;
    }

	/**
	 * Configure the Server to use [typescript-ioc](https://github.com/thiagobustamante/typescript-ioc)
	 * to instantiate the service objects.
	 * If You plan to use IoC, You must ensure to call this method before any typescript-rest service declaration.
	 */
    static useIoC() {
        const ioc = require('typescript-ioc');
        Server.registerServiceFactory({
            create: (serviceClass) => {
                return ioc.Container.get(serviceClass);
            },
            getTargetClass: (serviceClass: Function) => {
                let typeConstructor: any = serviceClass;
                if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                    return <FunctionConstructor>typeConstructor;
                }
                while (typeConstructor = typeConstructor['__parent']) {
                    if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                        return <FunctionConstructor>typeConstructor;
                    }
                }
                throw TypeError('Can not identify the base Type for requested target');
            }
        });
    }

	/**
	 * Return the set oh HTTP verbs configured for the given path
	 * @param path The path to search HTTP verbs
	 */
    static getHttpMethods(path: string): Array<HttpMethod> {
        const result = new Array<HttpMethod>();
        InternalServer.getHttpMethods(path).forEach(value => {
            result.push(value);
        });

        return result;
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
