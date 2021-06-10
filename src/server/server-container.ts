'use strict';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as debug from 'debug';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import * as multer from 'multer';
import * as Errors from './model/errors';
import { ServiceClass, ServiceMethod } from './model/metadata';
import {
    FileLimits, HttpMethod, ParameterConverter,
    ParserType, ServiceAuthenticator, ServiceContext, ServiceFactory
} from './model/server-types';
import { ServiceInvoker } from './service-invoker';

export class DefaultServiceFactory implements ServiceFactory {
    public create(serviceClass: any) {
        return new serviceClass();
    }
    public getTargetClass(serviceClass: Function) {
        return serviceClass as FunctionConstructor;
    }
}

export class ServerContainer {
    public static get(): ServerContainer {
        return ServerContainer.instance;
    }

    private static instance: ServerContainer = new ServerContainer();

    public cookiesSecret: string;
    public cookiesDecoder: (val: string) => string;
    public fileDest: string;
    public fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void;
    public fileLimits: FileLimits;
    public ignoreNextMiddlewares: boolean = false;
    public authenticator: Map<string, ServiceAuthenticator> = new Map<string, ServiceAuthenticator>();
    public serviceFactory: ServiceFactory = new DefaultServiceFactory();
    public paramConverters: Map<Function, ParameterConverter> = new Map<Function, ParameterConverter>();
    public router: express.Router;

    private debugger = {
        build: debug('typescript-rest:server-container:build'),
        runtime: debug('typescript-rest:server-container:runtime')
    };
    private upload: multer.Multer;
    private serverClasses: Map<Function, ServiceClass> = new Map<Function, ServiceClass>();
    private paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
    private pathsResolved: boolean = false;

    private constructor() { }

    public registerServiceClass(target: Function): ServiceClass {
        this.pathsResolved = false;
        target = this.serviceFactory.getTargetClass(target);
        if (!this.serverClasses.has(target)) {
            this.debugger.build('Registering a new service class, %o', target);
            this.serverClasses.set(target, new ServiceClass(target));
            this.inheritParentClass(target);
        }
        const serviceClass: ServiceClass = this.serverClasses.get(target);
        return serviceClass;
    }

    public registerServiceMethod(target: Function, methodName: string): ServiceMethod {
        if (methodName) {
            this.pathsResolved = false;
            const classData: ServiceClass = this.registerServiceClass(target);
            if (!classData.methods.has(methodName)) {
                this.debugger.build('Registering the rest method <%s> for the service class, %o', methodName, target);
                classData.methods.set(methodName, new ServiceMethod());
            }
            const serviceMethod: ServiceMethod = classData.methods.get(methodName);
            return serviceMethod;
        }
        return null;
    }

    public getPaths(): Set<string> {
        this.resolveAllPaths();
        const result = new Set<string>();
        this.paths.forEach((value, key) => {
            result.add(key);
        });
        return result;
    }

    public getHttpMethods(path: string): Set<HttpMethod> {
        this.resolveAllPaths();
        const methods: Set<HttpMethod> = this.paths.get(path);
        return methods || new Set<HttpMethod>();
    }

    public buildServices(types?: Array<Function>) {
        if (types) {
            types = types.map(type => this.serviceFactory.getTargetClass(type));
        }
        this.debugger.build('Creating service endpoints for types: %o', types);
        if (this.authenticator) {
            this.authenticator.forEach((auth, name) => {
                this.debugger.build('Initializing authenticator: %s', name);
                auth.initialize(this.router);
            });
        }
        this.serverClasses.forEach(classData => {
            if (!classData.isAbstract) {
                classData.methods.forEach(method => {
                    if (this.validateTargetType(classData.targetClass, types)) {
                        this.buildService(classData, method);
                    }
                });
            }
        });
        this.pathsResolved = true;
        this.handleNotAllowedMethods();
    }

    private inheritParentClass(target: Function) {
        const classData: ServiceClass = this.serverClasses.get(target);
        const parent = Object.getPrototypeOf(classData.targetClass.prototype).constructor;
        const parentClassData: ServiceClass = this.getServiceClass(parent);
        if (parentClassData) {
            if (parentClassData.methods) {
                parentClassData.methods.forEach((value, key) => {
                    classData.methods.set(key, _.cloneDeep(value));
                });
            }

            if (parentClassData.properties) {
                parentClassData.properties.forEach((value, key) => {
                    classData.properties.set(key, _.cloneDeep(value));
                });
            }

            if (parentClassData.languages) {
                classData.languages = _.union(classData.languages, parentClassData.languages);
            }

            if (parentClassData.accepts) {
                classData.accepts = _.union(classData.accepts, parentClassData.accepts);
            }
        }
        this.debugger.build('Service class registered with the given metadata: %o', classData);
    }

    private buildService(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
        this.debugger.build('Creating service endpoint for method: %o', serviceMethod);
        if (!serviceMethod.resolvedPath) {
            this.resolveProperties(serviceClass, serviceMethod);
        }

        let args: Array<any> = [serviceMethod.resolvedPath];
        args = args.concat(this.buildSecurityMiddlewares(serviceClass, serviceMethod));
        args = args.concat(this.buildParserMiddlewares(serviceClass, serviceMethod));
        args.push(this.buildServiceMiddleware(serviceMethod, serviceClass));
        switch (serviceMethod.httpMethod) {
            case HttpMethod.GET:
                this.router.get.apply(this.router, args);
                break;
            case HttpMethod.POST:
                this.router.post.apply(this.router, args);
                break;
            case HttpMethod.PUT:
                this.router.put.apply(this.router, args);
                break;
            case HttpMethod.DELETE:
                this.router.delete.apply(this.router, args);
                break;
            case HttpMethod.HEAD:
                this.router.head.apply(this.router, args);
                break;
            case HttpMethod.OPTIONS:
                this.router.options.apply(this.router, args);
                break;
            case HttpMethod.PATCH:
                this.router.patch.apply(this.router, args);
                break;

            default:
                throw Error(`Invalid http method for service [${serviceMethod.resolvedPath}]`);
        }
    }

    private resolveAllPaths() {
        if (!this.pathsResolved) {
            this.debugger.build('Building the server list of paths');
            this.paths.clear();
            this.serverClasses.forEach(classData => {
                classData.methods.forEach(method => {
                    if (!method.resolvedPath) {
                        this.resolveProperties(classData, method);
                    }
                });
            });
            this.pathsResolved = true;
        }
    }

    private getServiceClass(target: Function): ServiceClass {
        target = this.serviceFactory.getTargetClass(target);
        return this.serverClasses.get(target) || null;
    }

    private resolveProperties(serviceClass: ServiceClass,
        serviceMethod: ServiceMethod): void {
        this.resolveLanguages(serviceClass, serviceMethod);
        this.resolveAccepts(serviceClass, serviceMethod);
        this.resolvePath(serviceClass, serviceMethod);
    }

    private resolveLanguages(serviceClass: ServiceClass,
        serviceMethod: ServiceMethod): void {
        this.debugger.build('Resolving the list of acceptable languages for method %s', serviceMethod.name);

        const resolvedLanguages = _.union(serviceClass.languages, serviceMethod.languages);
        if (resolvedLanguages.length > 0) {
            serviceMethod.resolvedLanguages = resolvedLanguages;
        }
    }

    private resolveAccepts(serviceClass: ServiceClass,
        serviceMethod: ServiceMethod): void {

        this.debugger.build('Resolving the list of acceptable types for method %s', serviceMethod.name);
        const resolvedAccepts = _.union(serviceClass.accepts, serviceMethod.accepts);
        if (resolvedAccepts.length > 0) {
            serviceMethod.resolvedAccepts = resolvedAccepts;
        }
    }

    private resolvePath(serviceClass: ServiceClass,
        serviceMethod: ServiceMethod): void {

        this.debugger.build('Resolving the path for method %s', serviceMethod.name);

        const classPath: string = serviceClass.path ? serviceClass.path.trim() : '';
        let resolvedPath = _.startsWith(classPath, '/') ? classPath : '/' + classPath;
        if (_.endsWith(resolvedPath, '/')) {
            resolvedPath = resolvedPath.slice(0, resolvedPath.length - 1);
        }

        if (serviceMethod.path) {
            const methodPath: string = serviceMethod.path.trim();
            resolvedPath = resolvedPath + (_.startsWith(methodPath, '/') ? methodPath : '/' + methodPath);
        }

        let declaredHttpMethods: Set<HttpMethod> = this.paths.get(resolvedPath);
        if (!declaredHttpMethods) {
            declaredHttpMethods = new Set<HttpMethod>();
            this.paths.set(resolvedPath, declaredHttpMethods);
        }
        if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
            throw Error(`Duplicated declaration for path [${resolvedPath}], method [${serviceMethod.httpMethod}].`);
        }
        declaredHttpMethods.add(serviceMethod.httpMethod);
        serviceMethod.resolvedPath = resolvedPath;
    }

    private validateTargetType(targetClass: Function, types: Array<Function>): boolean {
        if (types && types.length > 0) {
            return (types.indexOf(targetClass) > -1);
        }
        return true;
    }

    private handleNotAllowedMethods() {
        this.debugger.build('Creating middleware to handle not allowed methods');
        const paths: Set<string> = this.getPaths();
        paths.forEach((path) => {
            const supported: Set<HttpMethod> = this.getHttpMethods(path);
            const allowedMethods: Array<string> = new Array<string>();
            supported.forEach((method: HttpMethod) => {
                allowedMethods.push(HttpMethod[method]);
            });
            const allowed: string = allowedMethods.join(', ');
            this.debugger.build('Registering middleware to validate allowed HTTP methods for path %s.', path);
            this.debugger.build('Allowed HTTP methods [%s].', allowed);
            this.router.all(path, (req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (res.headersSent || allowedMethods.indexOf(req.method) > -1) {
                    next();
                } else {
                    res.set('Allow', allowed);
                    throw new Errors.MethodNotAllowedError();
                }
            });
        });
    }

    private getUploader(): multer.Multer {
        if (!this.upload) {
            const options: multer.Options = {};
            if (this.fileDest) {
                options.dest = this.fileDest;
            }
            if (this.fileFilter) {
                options.fileFilter = this.fileFilter;
            }
            if (this.fileLimits) {
                options.limits = this.fileLimits;
            }
            if (options.dest) {
                this.debugger.build('Creating a file Uploader with options: %o.', options);
                this.upload = multer(options);
            } else {
                this.debugger.build('Creating a file Uploader with the default options.');
                this.upload = multer();
            }
        }
        return this.upload;
    }

    private buildServiceMiddleware(serviceMethod: ServiceMethod, serviceClass: ServiceClass) {
        const serviceInvoker = new ServiceInvoker(serviceClass, serviceMethod);
        this.debugger.build('Creating the service middleware for method <%s>.', serviceMethod.name);
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const context: ServiceContext = new ServiceContext();
            context.request = req;
            context.response = res;
            context.next = next;
            await serviceInvoker.callService(context);
        };
    }

    private buildSecurityMiddlewares(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
        const result: Array<express.RequestHandler> = new Array<express.RequestHandler>();
        const authenticatorMap: Record<string, Array<string>> | undefined = serviceMethod.authenticator || serviceClass.authenticator;
        if (this.authenticator && authenticatorMap) {
            const authenticatorNames: Array<string> = Object.keys(authenticatorMap);
            for (const authenticatorName of authenticatorNames) {
                let roles: Array<string> = authenticatorMap[authenticatorName];
                this.debugger.build('Registering an authenticator middleware <%s> for method <%s>.', authenticatorName, serviceMethod.name);
                const authenticator = this.getAuthenticator(authenticatorName);
                result.push(authenticator.getMiddleware());
                roles = roles.filter((role) => role !== '*');
                if (roles.length) {
                    this.debugger.build('Registering a role validator middleware <%s> for method <%s>.', authenticatorName, serviceMethod.name);
                    this.debugger.build('Roles: <%j>.', roles);
                    result.push(this.buildAuthMiddleware(authenticator, roles));
                }
            }
        }

        return result;
    }

    private getAuthenticator(authenticatorName: string) {
        if (!this.authenticator.has(authenticatorName)) {
            throw new Error(`Invalid authenticator name ${authenticatorName}`);
        }
        return this.authenticator.get(authenticatorName);
    }

    private buildAuthMiddleware(authenticator: ServiceAuthenticator, roles: Array<string>): express.RequestHandler {
        return (req: Request, res: Response, next: NextFunction) => {
            const requestRoles = authenticator.getRoles(req, res);
            if (this.debugger.runtime.enabled) {
                this.debugger.runtime('Validating authentication roles: <%j>.', requestRoles);
            }
            if (requestRoles.some((role: string) => roles.indexOf(role) >= 0)) {
                next();
            }
            else {
                throw new Errors.ForbiddenError();
            }
        };
    }

    private buildParserMiddlewares(serviceClass: ServiceClass, serviceMethod: ServiceMethod): Array<express.RequestHandler> {
        const result: Array<express.RequestHandler> = new Array<express.RequestHandler>();
        const bodyParserOptions = serviceMethod.bodyParserOptions || serviceClass.bodyParserOptions;

        if (serviceMethod.mustParseCookies) {
            this.debugger.build('Registering cookie parser middleware for method <%s>.', serviceMethod.name);
            result.push(this.buildCookieParserMiddleware());
        }
        if (serviceMethod.mustParseBody) {
            const bodyParserType = serviceMethod.bodyParserType || serviceClass.bodyParserType || ParserType.json;
            this.debugger.build('Registering body %s parser middleware for method <%s>' +
                ' with options: %j.', ParserType[bodyParserType], serviceMethod.name, bodyParserOptions);
            result.push(this.buildBodyParserMiddleware(serviceMethod, bodyParserOptions, bodyParserType));
        }
        if (serviceMethod.mustParseForms || serviceMethod.acceptMultiTypedParam) {
            this.debugger.build('Registering body form parser middleware for method <%s>' +
                ' with options: %j.', serviceMethod.name, bodyParserOptions);
            result.push(this.buildFormParserMiddleware(bodyParserOptions));
        }
        if (serviceMethod.files.length > 0) {
            this.debugger.build('Registering file parser middleware for method <%s>.', serviceMethod.name);
            result.push(this.buildFilesParserMiddleware(serviceMethod));
        }

        return result;
    }

    private buildBodyParserMiddleware(serviceMethod: ServiceMethod, bodyParserOptions: any, bodyParserType: ParserType) {
        switch (bodyParserType) {
            case ParserType.text:
                return this.buildTextBodyParserMiddleware(bodyParserOptions);
            case ParserType.raw:
                return this.buildRawBodyParserMiddleware(bodyParserOptions);
            default:
                return this.buildJsonBodyParserMiddleware(bodyParserOptions);
        }
    }

    private buildFilesParserMiddleware(serviceMethod: ServiceMethod) {
        const options: Array<multer.Field> = new Array<multer.Field>();
        serviceMethod.files.forEach(fileData => {
            if (fileData.singleFile) {
                options.push({ 'name': fileData.name, 'maxCount': 1 });
            }
            else {
                options.push({ 'name': fileData.name });
            }
        });
        this.debugger.build('Creating file parser with options %j.', options);
        return this.getUploader().fields(options);
    }

    private buildFormParserMiddleware(bodyParserOptions: any) {
        let middleware: express.RequestHandler;
        if (!bodyParserOptions) {
            bodyParserOptions = { extended: true };
        }
        this.debugger.build('Creating form body parser with options %j.', bodyParserOptions);
        middleware = bodyParser.urlencoded(bodyParserOptions);
        return middleware;
    }

    private buildJsonBodyParserMiddleware(bodyParserOptions: any) {
        let middleware: express.RequestHandler;
        this.debugger.build('Creating json body parser with options %j.', bodyParserOptions || {});
        if (bodyParserOptions) {
            middleware = bodyParser.json(bodyParserOptions);
        }
        else {
            middleware = bodyParser.json();
        }
        return middleware;
    }

    private buildTextBodyParserMiddleware(bodyParserOptions: any) {
        let middleware: express.RequestHandler;
        this.debugger.build('Creating text body parser with options %j.', bodyParserOptions || {});
        if (bodyParserOptions) {
            middleware = bodyParser.text(bodyParserOptions);
        }
        else {
            middleware = bodyParser.text();
        }
        return middleware;
    }

    private buildRawBodyParserMiddleware(bodyParserOptions: any) {
        let middleware: express.RequestHandler;
        this.debugger.build('Creating raw body parser with options %j.', bodyParserOptions || {});
        if (bodyParserOptions) {
            middleware = bodyParser.raw(bodyParserOptions);
        }
        else {
            middleware = bodyParser.raw();
        }
        return middleware;
    }

    private buildCookieParserMiddleware() {
        const args = [];
        if (this.cookiesSecret) {
            args.push(this.cookiesSecret);
        }
        if (this.cookiesDecoder) {
            args.push({ decode: this.cookiesDecoder });
        }
        this.debugger.build('Creating cookie parser with options %j.', args);
        const middleware = cookieParser.apply(this, args);
        return middleware;
    }
}
