'use strict';

import * as debug from 'debug';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import 'multer';
import * as path from 'path';
import * as YAML from 'yamljs';
import {
    FileLimits, HttpMethod, ParameterConverter,
    ServiceAuthenticator, ServiceFactory
} from './model/server-types';
import { ServerContainer } from './server-container';

const serverDebugger = debug('typescript-rest:server:build');

/**
 * The Http server main class.
 */
export class Server {

    /**
     * Create the routes for all classes decorated with our decorators
     */
    public static buildServices(router: express.Router, ...types: Array<any>) {
        serverDebugger('Creating typescript-rest services handlers');
        const serverContainer = ServerContainer.get();
        serverContainer.router = router;
        serverContainer.buildServices(types);
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
        serverDebugger('Loading typescript-rest services %j. BaseDir: %s', patterns, baseDir);
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
        ServerContainer.get().getPaths().forEach(value => {
            result.push(value);
        });

        return result;
    }

    /**
     * Register a custom serviceFactory. It will be used to instantiate the service Objects
     * If You plan to use a custom serviceFactory, You must ensure to call this method before any typescript-rest service declaration.
     */
    public static registerServiceFactory(serviceFactory: ServiceFactory | string) {
        let factory: ServiceFactory;
        if (typeof serviceFactory === 'string') {
            factory = require(serviceFactory);
        } else {
            factory = serviceFactory as ServiceFactory;
        }

        serverDebugger('Registering a new serviceFactory');
        ServerContainer.get().serviceFactory = factory;
    }

    /**
     * Register a service authenticator. It will be used to authenticate users before the service method
     * invocations occurs.
     */
    public static registerAuthenticator(authenticator: ServiceAuthenticator, name: string = 'default') {
        serverDebugger('Registering a new authenticator with name %s', name);
        ServerContainer.get().authenticator.set(name, authenticator);
    }

    /**
     * Configure the Server to use [typescript-ioc](https://github.com/thiagobustamante/typescript-ioc)
     * to instantiate the service objects.
     * If You plan to use IoC, You must ensure to call this method before any typescript-rest service declaration.
     * @param es6 if true, import typescript-ioc/es6
     */
    public static useIoC(es6: boolean = false) {
        const ioc = require(es6 ? 'typescript-ioc/es6' : 'typescript-ioc');
        serverDebugger('Configuring a serviceFactory to use typescript-ioc to instantiate services. ES6: ', es6);
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
        ServerContainer.get().getHttpMethods(servicePath).forEach(value => {
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
        serverDebugger('Setting a new secret for cookies: %s', secret);
        ServerContainer.get().cookiesSecret = secret;
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
        serverDebugger('Setting a new secret decoder');
        ServerContainer.get().cookiesDecoder = decoder;
    }

    /**
     * Set where to store the uploaded files
     * @param dest Destination folder
     */
    public static setFileDest(dest: string) {
        serverDebugger('Setting a new destination for files: %s', dest);
        ServerContainer.get().fileDest = dest;
    }

    /**
     * Set a Function to control which files are accepted to upload
     * @param filter The filter function
     */
    public static setFileFilter(filter: (req: Express.Request, file: Express.Multer.File,
        callback: (error: Error, acceptFile: boolean) => void) => void) {
        serverDebugger('Setting a new filter for files');
        ServerContainer.get().fileFilter = filter;
    }

    /**
     * Set the limits of uploaded data
     * @param limit The data limit
     */
    public static setFileLimits(limit: FileLimits) {
        serverDebugger('Setting a new fileLimits: %j', limit);
        ServerContainer.get().fileLimits = limit;
    }

    /**
     * Adds a converter for param values to have an ability to intercept the type that actually will be passed to service
     * @param converter The converter
     * @param type The target type that needs to be converted
     */
    public static addParameterConverter(converter: ParameterConverter, type: Function): void {
        serverDebugger('Adding a new parameter converter');
        ServerContainer.get().paramConverters.set(type, converter);
    }

    /**
     * Remove the converter associated with the given type.
     * @param type The target type that needs to be converted
     */
    public static removeParameterConverter(type: Function): void {
        serverDebugger('Removing a parameter converter');
        ServerContainer.get().paramConverters.delete(type);
    }

    /**
     * Makes the server ignore next middlewares for all endpoints.
     * It has the same effect than add @IgnoreNextMiddlewares to all
     * services.
     * @param value - true to ignore next middlewares. 
     */
    public static ignoreNextMiddlewares(value: boolean) {
        serverDebugger('Ignoring next middlewares: %b', value);
        ServerContainer.get().ignoreNextMiddlewares = value;
    }

    /**
     * Creates and endpoint to publish the swagger documentation.
     * @param router Express router
     * @param options Options for swagger endpoint
     */
    public static swagger(router: express.Router, options?: SwaggerOptions) {
        const swaggerUi = require('swagger-ui-express');
        options = Server.getOptions(options);
        serverDebugger('Configuring open api documentation endpoints for options: %j', options);

        const swaggerDocument: any = Server.loadSwaggerDocument(options);

        if (options.host) {
            swaggerDocument.host = options.host;
        }
        if (options.schemes) {
            swaggerDocument.schemes = options.schemes;
        }

        router.get(path.posix.join('/', options.endpoint, 'json'), (req, res, next) => {
            res.send(swaggerDocument);
        });
        router.get(path.posix.join('/', options.endpoint, 'yaml'), (req, res, next) => {
            res.set('Content-Type', 'text/vnd.yaml');
            res.send(YAML.stringify(swaggerDocument, 1000));
        });
        router.use(path.posix.join('/', options.endpoint), swaggerUi.serve, swaggerUi.setup(swaggerDocument, options.swaggerUiOptions));
    }

    private static loadSwaggerDocument(options: SwaggerOptions) {
        let swaggerDocument: any;
        if (_.endsWith(options.filePath, '.yml') || _.endsWith(options.filePath, '.yaml')) {
            swaggerDocument = YAML.load(options.filePath);
        }
        else {
            swaggerDocument = fs.readJSONSync(options.filePath);
        }
        serverDebugger('Loaded swagger configurations: %j', swaggerDocument);
        return swaggerDocument;
    }

    private static getOptions(options: SwaggerOptions) {
        options = _.defaults(options, {
            endpoint: 'api-docs',
            filePath: './swagger.json'
        });
        if (_.startsWith(options.filePath, '.')) {
            options.filePath = path.join(process.cwd(), options.filePath);
        }
        return options;
    }
}

export interface SwaggerOptions {
    /**
     * The path to a swagger file (json or yaml)
     */
    filePath?: string;
    /**
     * Where to publish the docs
     */
    endpoint?: string;
    /**
     * The hostname of the service
     */
    host?: string;
    /**
     * The schemes used by the server
     */
    schemes?: Array<string>;
    /**
     * Options to send to swagger-ui
     */
    swaggerUiOptions?: object;
}
