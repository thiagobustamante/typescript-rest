'use strict';

import * as express from 'express';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import 'multer';
import * as path from 'path';
import * as YAML from 'yamljs';
import { InternalServer } from './server-container';
import { FileLimits, HttpMethod, ServiceFactory } from './server-types';

/**
 * The Http server main class.
 */
export class Server {
    /**
     * Create the routes for all classes decorated with our decorators
     */
    public static buildServices(router: express.Router, ...types: Array<any>) {
        const iternalServer: InternalServer = new InternalServer(router);
        iternalServer.buildServices(types);
    }

    /**
     * Define passportAuth strategy
     */
    public static passportAuth(strategy: string, roleKey: string = 'roles') {
        InternalServer.passportAuth(strategy, roleKey);
    }

    /**
     * An alias for Server.loadServices()
     */
    public static loadControllers(router: express.Router, patterns: string | Array<string>, baseDir?: string) {
        Server.loadServices(router, patterns, baseDir);
    }

    /**
     * Load all services from the files that matches the patterns provided
     */
    public static loadServices(router: express.Router, patterns: string | Array<string>, baseDir?: string) {
        const importedTypes: Array<Function> = [];
        const requireGlob = require('require-glob');
        baseDir = baseDir || process.cwd();
        const loadedModules: Array<any> = requireGlob.sync(patterns, {
            cwd: baseDir
        });

        _.values(loadedModules).forEach(serviceModule => {
            _.values(serviceModule).forEach((service: Function) => {
                importedTypes.push(service);
            });
        });

        try {
            Server.buildServices(router, ...importedTypes);
        } catch (e) {
            throw new TypeError(`Error loading services for pattern: ${JSON.stringify(patterns)}. Error: ${e.message}`);
        }
    }

    /**
     * Return all paths accepted by the Server
     */
    public static getPaths(): Array<string> {
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
    public static registerServiceFactory(serviceFactory: ServiceFactory) {
        InternalServer.serviceFactory = serviceFactory;
    }

    /**
     * Configure the Server to use [typescript-ioc](https://github.com/thiagobustamante/typescript-ioc)
     * to instantiate the service objects.
     * If You plan to use IoC, You must ensure to call this method before any typescript-rest service declaration.
     * @param es6 if true, import typescript-ioc/es6
     */
    public static useIoC(es6?: boolean) {
        const ioc = require(es6 ? 'typescript-ioc/es6' : 'typescript-ioc');
        Server.registerServiceFactory({
            create: (serviceClass) => {
                return ioc.Container.get(serviceClass);
            },
            getTargetClass: (serviceClass: Function) => {
                let typeConstructor: any = serviceClass;
                if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                    return typeConstructor as FunctionConstructor;
                }
                typeConstructor = typeConstructor['__parent'];
                while (typeConstructor) {
                    if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                        return typeConstructor as FunctionConstructor;
                    }
                    typeConstructor = typeConstructor['__parent'];
                }
                throw TypeError('Can not identify the base Type for requested target');
            }
        });
    }

    /**
     * Return the set oh HTTP verbs configured for the given path
     * @param servicePath The path to search HTTP verbs
     */
    public static getHttpMethods(servicePath: string): Array<HttpMethod> {
        const result = new Array<HttpMethod>();
        InternalServer.getHttpMethods(servicePath).forEach(value => {
            result.push(value);
        });

        return result;
    }

    /**
     * A string used for signing cookies. This is optional and if not specified,
     * will not parse signed cookies.
     * @param secret the secret used to sign
     */
    public static setCookiesSecret(secret: string) {
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
    public static setCookiesDecoder(decoder: (val: string) => string) {
        InternalServer.cookiesDecoder = decoder;
    }

    /**
     * Set where to store the uploaded files
     * @param dest Destination folder
     */
    public static setFileDest(dest: string) {
        InternalServer.fileDest = dest;
    }

    /**
     * Set a Function to control which files are accepted to upload
     * @param filter The filter function
     */
    public static setFileFilter(filter: (req: Express.Request, file: Express.Multer.File,
        callback: (error: Error, acceptFile: boolean) => void) => void) {
        InternalServer.fileFilter = filter;
    }

    /**
     * Set the limits of uploaded data
     * @param limit The data limit
     */
    public static setFileLimits(limit: FileLimits) {
        InternalServer.fileLimits = limit;
    }

    /**
     * Sets converter for param values to have an ability to intercept the type that actually will be passed to service
     * @param fn The converter
     */
    public static setParamConverter(fn: (paramValue: any, paramType: Function) => any) {
        InternalServer.paramConverter = fn;
    }

    /**
     * Creates and endpoint to publish the swagger documentation.
     * @param router Express router
     * @param filePath the path to a swagger file (json or yaml)
     * @param endpoint where to publish the docs
     * @param host the hostname of the service
     * @param schemes the schemes used by the server
     */
    public static swagger(router: express.Router, filePath: string, endpoint: string, host?: string, schemes?: Array<string>, swaggerUiOptions?: object) {
        const swaggerUi = require('swagger-ui-express');
        if (_.startsWith(filePath, '.')) {
            filePath = path.join(process.cwd(), filePath);
        }

        let swaggerDocument: any;
        if (_.endsWith(filePath, '.yml') || _.endsWith(filePath, '.yaml')) {
            swaggerDocument = YAML.load(filePath);
        } else {
            swaggerDocument = fs.readJSONSync(filePath);
        }

        if (host) {
            swaggerDocument.host = host;
        }
        if (schemes) {
            swaggerDocument.schemes = schemes;
        }

        router.get(path.posix.join('/', endpoint, 'json'), (req, res, next) => {
            res.send(swaggerDocument);
        });
        router.get(path.posix.join('/', endpoint, 'yaml'), (req, res, next) => {
            res.set('Content-Type', 'text/vnd.yaml');
            res.send(YAML.stringify(swaggerDocument, 1000));
        });
        router.use(path.posix.join('/', endpoint), swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));
    }
}
