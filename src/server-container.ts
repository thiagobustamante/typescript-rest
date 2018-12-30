'use strict';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as _ from 'lodash';
import * as multer from 'multer';
import * as metadata from './metadata';
import * as Errors from './server-errors';

import { NextFunction, Request, Response } from 'express';
import { DownloadBinaryData, DownloadResource } from './server-return';
import { FileLimits, HttpMethod, ParameterConverter, ReferencedResource, ServiceAuthenticator, ServiceContext, ServiceFactory } from './server-types';

export class DefaultServiceFactory implements ServiceFactory {
    public create(serviceClass: any) {
        return new serviceClass();
    }
    public getTargetClass(serviceClass: Function) {
        return serviceClass as FunctionConstructor;
    }
}

export class InternalServer {
    public static get(): InternalServer {
        return InternalServer.instance;
    }

    private static instance: InternalServer = new InternalServer();

    private static defaultParamConverter: ParameterConverter = (p: any) => p;

    public cookiesSecret: string;
    public cookiesDecoder: (val: string) => string;
    public fileDest: string;
    public fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void;
    public fileLimits: FileLimits;
    public authenticator: ServiceAuthenticator;
    public serviceFactory: ServiceFactory = new DefaultServiceFactory();
    public paramConverters: Map<Function, ParameterConverter> = new Map<Function, ParameterConverter>();
    public router: express.Router;

    private upload: multer.Instance;
    private serverClasses: Map<Function, metadata.ServiceClass> = new Map<Function, metadata.ServiceClass>();
    private paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
    private pathsResolved: boolean = false;

    private constructor() { }

    public registerServiceClass(target: Function): metadata.ServiceClass {
        this.pathsResolved = false;
        target = this.serviceFactory.getTargetClass(target);
        if (!this.serverClasses.has(target)) {
            this.serverClasses.set(target, new metadata.ServiceClass(target));
            this.inheritParentClass(target);
        }
        const serviceClass: metadata.ServiceClass = this.serverClasses.get(target);
        return serviceClass;
    }

    public inheritParentClass(target: Function) {
        const classData: metadata.ServiceClass = this.serverClasses.get(target);
        const parent = Object.getPrototypeOf(classData.targetClass.prototype).constructor;
        const parentClassData: metadata.ServiceClass = this.getServiceClass(parent);
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
                for (const lang of parentClassData.languages) {
                    classData.languages.push(lang);
                }
            }

            if (parentClassData.accepts) {
                for (const acc of parentClassData.accepts) {
                    classData.accepts.push(acc);
                }
            }
        }
    }

    public registerServiceMethod(target: Function, methodName: string): metadata.ServiceMethod {
        if (methodName) {
            this.pathsResolved = false;
            const classData: metadata.ServiceClass = this.registerServiceClass(target);
            if (!classData.methods.has(methodName)) {
                classData.methods.set(methodName, new metadata.ServiceMethod());
            }
            const serviceMethod: metadata.ServiceMethod = classData.methods.get(methodName);
            return serviceMethod;
        }
        return null;
    }

    public resolveAllPaths() {
        if (!this.pathsResolved) {
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
        if (this.authenticator) {
            this.authenticator.initialize(this.router);
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

    public async runPreprocessors(processors: Array<Function>, req: express.Request): Promise<void> {
        for (const processor of processors) {
            await Promise.resolve(processor(req));
        }
    }

    public buildService(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod) {

        if (!serviceMethod.resolvedPath) {
            this.resolveProperties(serviceClass, serviceMethod);
        }

        let args: Array<any> = [serviceMethod.resolvedPath];
        args = args.concat(this.buildSecurityMiddlewares(serviceClass, serviceMethod));
        args = args.concat(this.buildParserMiddlewares(serviceMethod));
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

    private getServiceClass(target: Function): metadata.ServiceClass {
        target = this.serviceFactory.getTargetClass(target);
        return this.serverClasses.get(target) || null;
    }

    private resolveLanguages(serviceClass: metadata.ServiceClass,
        serviceMethod: metadata.ServiceMethod): void {
        const resolvedLanguages = new Array<string>();
        if (serviceClass.languages) {
            serviceClass.languages.forEach(lang => {
                resolvedLanguages.push(lang);
            });
        }
        if (serviceMethod.languages) {
            serviceMethod.languages.forEach(lang => {
                resolvedLanguages.push(lang);
            });
        }
        if (resolvedLanguages.length > 0) {
            serviceMethod.resolvedLanguages = resolvedLanguages;
        }
    }

    private resolveAccepts(serviceClass: metadata.ServiceClass,
        serviceMethod: metadata.ServiceMethod): void {
        const resolvedAccepts = new Array<string>();
        if (serviceClass.accepts) {
            serviceClass.accepts.forEach(accept => {
                resolvedAccepts.push(accept);
            });
        }
        if (serviceMethod.accepts) {
            serviceMethod.accepts.forEach(accept => {
                resolvedAccepts.push(accept);
            });
        }
        if (resolvedAccepts.length > 0) {
            serviceMethod.resolvedAccepts = resolvedAccepts;
        }
    }

    private resolveProperties(serviceClass: metadata.ServiceClass,
        serviceMethod: metadata.ServiceMethod): void {
        this.resolveLanguages(serviceClass, serviceMethod);
        this.resolveAccepts(serviceClass, serviceMethod);
        this.resolvePath(serviceClass, serviceMethod);
    }

    private resolvePath(serviceClass: metadata.ServiceClass,
        serviceMethod: metadata.ServiceMethod): void {
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
        const paths: Set<string> = this.getPaths();
        paths.forEach((path) => {
            const supported: Set<HttpMethod> = this.getHttpMethods(path);
            const allowedMethods: Array<string> = new Array<string>();
            supported.forEach((method: HttpMethod) => {
                allowedMethods.push(HttpMethod[method]);
            });
            const allowed: string = allowedMethods.join(', ');
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

    private getUploader(): multer.Instance {
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
                this.upload = multer(options);
            } else {
                this.upload = multer();
            }
        }
        return this.upload;
    }

    private buildServiceMiddleware(serviceMethod: metadata.ServiceMethod, serviceClass: metadata.ServiceClass) {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                if (serviceMethod.processors || serviceClass.processors) {
                    const allPreprocessors = [...serviceClass.processors || [], ...serviceMethod.processors || []];
                    await this.runPreprocessors(allPreprocessors, req);
                }
                await this.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
                next();
            }
            catch (err) {
                next(err);
            }
        };
    }

    private buildSecurityMiddlewares(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod) {
        const result: Array<express.RequestHandler> = new Array<express.RequestHandler>();
        let roles: Array<string> = [...(serviceMethod.roles || []), ...(serviceClass.roles || [])]
            .filter((role) => !!role);
        if (this.authenticator && roles.length) {
            result.push(this.authenticator.getMiddleware());
            roles = roles.filter((role) => role !== '*');
            if (roles.length) {
                result.push((req: Request, res: Response, next: NextFunction) => {
                    const requestRoles = this.authenticator.getRoles(req);
                    if (requestRoles.some((role: string) => roles.indexOf(role) >= 0)) {
                        next();
                    } else {
                        throw new Errors.ForbiddenError();
                    }
                });
            }
        }

        return result;
    }

    private buildParserMiddlewares(serviceMethod: metadata.ServiceMethod): Array<express.RequestHandler> {
        const result: Array<express.RequestHandler> = new Array<express.RequestHandler>();

        if (serviceMethod.mustParseCookies) {
            const args = [];
            if (this.cookiesSecret) {
                args.push(this.cookiesSecret);
            }
            if (this.cookiesDecoder) {
                args.push({ decode: this.cookiesDecoder });
            }
            result.push(cookieParser.apply(this, args));
        }
        if (serviceMethod.mustParseBody) {
            if (serviceMethod.bodyParserOptions) {
                result.push(bodyParser.json(serviceMethod.bodyParserOptions));
            } else {
                result.push(bodyParser.json());
            }
            // TODO adicionar parser de XML para o body
        }
        if (serviceMethod.mustParseForms || serviceMethod.acceptMultiTypedParam) {
            if (serviceMethod.bodyParserOptions) {
                result.push(bodyParser.urlencoded(serviceMethod.bodyParserOptions));
            } else {
                result.push(bodyParser.urlencoded({ extended: true }));
            }
        }
        if (serviceMethod.files.length > 0) {
            const options: Array<multer.Field> = new Array<multer.Field>();
            serviceMethod.files.forEach(fileData => {
                if (fileData.singleFile) {
                    options.push({ 'name': fileData.name, 'maxCount': 1 });
                } else {
                    options.push({ 'name': fileData.name });
                }
            });
            result.push(this.getUploader().fields(options));
        }

        return result;
    }

    private processResponseHeaders(serviceMethod: metadata.ServiceMethod, context: ServiceContext) {
        if (serviceMethod.resolvedLanguages) {
            if (serviceMethod.httpMethod === HttpMethod.GET) {
                context.response.vary('Accept-Language');
            }
            context.response.set('Content-Language', context.language);
        }
        if (serviceMethod.resolvedAccepts) {
            context.response.vary('Accept');
        }
    }

    private checkAcceptance(serviceMethod: metadata.ServiceMethod, context: ServiceContext): void {
        if (serviceMethod.resolvedLanguages) {
            const lang: any = context.request.acceptsLanguages(serviceMethod.resolvedLanguages);
            if (lang) {
                context.language = lang as string;
            }
        } else {
            const languages: Array<string> = context.request.acceptsLanguages();
            if (languages && languages.length > 0) {
                context.language = languages[0];
            }
        }

        if (serviceMethod.resolvedAccepts) {
            const accept: any = context.request.accepts(serviceMethod.resolvedAccepts);
            if (accept) {
                context.accept = accept as string;
            } else {
                throw new Errors.NotAcceptableError('Accept');
            }
        }

        if (!context.language) {
            throw new Errors.NotAcceptableError('Accept-Language');
        }
    }

    private createService(serviceClass: metadata.ServiceClass, context: ServiceContext) {
        const serviceObject = this.serviceFactory.create(serviceClass.targetClass, context);
        if (serviceClass.hasProperties()) {
            serviceClass.properties.forEach((property, key) => {
                serviceObject[key] = this.processParameter(property.type, context, property.name, property.propertyType);
            });
        }
        return serviceObject;
    }

    private async callTargetEndPoint(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod,
        req: express.Request, res: express.Response, next: express.NextFunction) {
        const context: ServiceContext = new ServiceContext();
        context.request = req;
        context.response = res;
        context.next = next;

        this.checkAcceptance(serviceMethod, context);
        const serviceObject = this.createService(serviceClass, context);
        const args = this.buildArgumentsList(serviceMethod, context);
        const toCall = serviceClass.targetClass.prototype[serviceMethod.name] || serviceClass.targetClass[serviceMethod.name];
        const result = toCall.apply(serviceObject, args);
        this.processResponseHeaders(serviceMethod, context);
        await this.sendValue(result, res, next);
    }

    private async sendValue(value: any, res: express.Response, next: express.NextFunction) {
        switch (typeof value) {
            case 'number':
                res.send(value.toString());
                break;
            case 'string':
                res.send(value);
                break;
            case 'boolean':
                res.send(value.toString());
                break;
            case 'undefined':
                if (!res.headersSent) {
                    res.sendStatus(204);
                }
                break;
            default:
                if (value.filePath && value instanceof DownloadResource) {
                    await this.downloadResToPromise(res, value);
                } else if (value instanceof DownloadBinaryData) {
                    if (value.fileName) {
                        res.writeHead(200, {
                            'Content-Length': value.content.length,
                            'Content-Type': value.mimeType,
                            'Content-disposition': 'attachment;filename=' + value.fileName
                        });
                    } else {
                        res.writeHead(200, {
                            'Content-Length': value.content.length,
                            'Content-Type': value.mimeType
                        });
                    }
                    res.end(value.content);
                } else if (value.location && value instanceof ReferencedResource) {
                    res.set('Location', value.location);
                    if (value.body) {
                        res.status(value.statusCode);
                        await this.sendValue(value.body, res, next);
                    } else {
                        res.sendStatus(value.statusCode);
                    }
                } else if (value.then && value.catch) {
                    const val = await value;
                    await this.sendValue(val, res, next);
                } else {
                    res.json(value);
                }
        }
    }

    private downloadResToPromise(res: express.Response, value: DownloadResource) {
        return new Promise((resolve, reject) => {
            res.download(value.filePath, value.filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private buildArgumentsList(serviceMethod: metadata.ServiceMethod, context: ServiceContext) {
        const result: Array<any> = new Array<any>();

        serviceMethod.parameters.forEach(param => {
            result.push(this.processParameter(param.paramType, context, param.name, param.type));
        });

        return result;
    }

    private processParameter(paramType: metadata.ParamType, context: ServiceContext, name: string, type: any) {
        switch (paramType) {
            case metadata.ParamType.path:
                return this.convertType(context.request.params[name], type);
            case metadata.ParamType.query:
                return this.convertType(context.request.query[name], type);
            case metadata.ParamType.header:
                return this.convertType(context.request.header(name), type);
            case metadata.ParamType.cookie:
                return this.convertType(context.request.cookies[name], type);
            case metadata.ParamType.body:
                return this.convertType(context.request.body, type);
            case metadata.ParamType.file:
                // @ts-ignore
                const files: Array<Express.Multer.File> = context.request.files ? context.request.files[name] : null;
                if (files && files.length > 0) {
                    return files[0];
                }
                return null;
            case metadata.ParamType.files:
                // @ts-ignore
                return context.request.files[name];
            case metadata.ParamType.form:
                return this.convertType(context.request.body[name], type);
            case metadata.ParamType.param:
                const paramValue = context.request.body[name] ||
                    context.request.query[name];
                return this.convertType(paramValue, type);
            case metadata.ParamType.context:
                return context;
            case metadata.ParamType.context_request:
                return context.request;
            case metadata.ParamType.context_response:
                return context.response;
            case metadata.ParamType.context_next:
                return context.next;
            case metadata.ParamType.context_accept:
                return context.accept;
            case metadata.ParamType.context_accept_language:
                return context.language;
            default:
                throw new Errors.BadRequestError('Invalid parameter type');
        }
    }

    private convertType(paramValue: string, paramType: Function): any {
        const serializedType = paramType['name'];
        switch (serializedType) {
            case 'Number':
                return paramValue === undefined ? paramValue : parseFloat(paramValue);
            case 'Boolean':
                return paramValue === undefined ? paramValue : paramValue === 'true';
            default:
                let converter = this.paramConverters.get(paramType);
                if (!converter) {
                    converter = InternalServer.defaultParamConverter;
                }

                return converter(paramValue);
        }
    }
}
