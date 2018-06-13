'use strict';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as multer from 'multer';
import * as metadata from './metadata';
import * as Errors from './server-errors';
import * as _ from 'lodash';

import { HttpMethod, ServiceContext, ReferencedResource, ServiceFactory, FileLimits } from './server-types';
import { DownloadResource, DownloadBinaryData } from './server-return';

export class InternalServer {
    static serverClasses: Map<string, metadata.ServiceClass> = new Map<string, metadata.ServiceClass>();
    static paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
    static pathsResolved: boolean = false;
    static cookiesSecret: string;
    static cookiesDecoder: (val: string) => string;
    static fileDest: string;
    static paramConverter: (paramValue: any, paramType: Function) => any = (p, t) => p;
    static fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void;
    static fileLimits: FileLimits;
    static serviceFactory: ServiceFactory = {
        create: (serviceClass: any) => {
            return new serviceClass();
        },
        getTargetClass: (serviceClass: Function) => {
            return <FunctionConstructor>serviceClass;
        }
    };

    router: express.Router;
    upload: multer.Instance;

    constructor(router: express.Router) {
        this.router = router;
    }

    static registerServiceClass(target: Function): metadata.ServiceClass {
        InternalServer.pathsResolved = false;
        target = InternalServer.serviceFactory.getTargetClass(target);
        const name: string = target['name'] || target.constructor['name'];
        if (!InternalServer.serverClasses.has(name)) {
            InternalServer.serverClasses.set(name, new metadata.ServiceClass(target));
            InternalServer.inheritParentClass(name);
        }
        const serviceClass: metadata.ServiceClass = InternalServer.serverClasses.get(name);
        return serviceClass;
    }

    static inheritParentClass(name: string) {
        const classData: metadata.ServiceClass = InternalServer.serverClasses.get(name);
        const parent = Object.getPrototypeOf(classData.targetClass.prototype).constructor;
        const parentClassData: metadata.ServiceClass = InternalServer.getServiceClass(parent);
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

    static registerServiceMethod(target: Function, methodName: string): metadata.ServiceMethod {
        if (methodName) {
            InternalServer.pathsResolved = false;
            const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
            if (!classData.methods.has(methodName)) {
                classData.methods.set(methodName, new metadata.ServiceMethod());
            }
            const serviceMethod: metadata.ServiceMethod = classData.methods.get(methodName);
            return serviceMethod;
        }
        return null;
    }

    buildServices(types?: Array<Function>) {
        if (types) {
            types = types.map(type => InternalServer.serviceFactory.getTargetClass(type));
        }
        InternalServer.serverClasses.forEach(classData => {
            if (!classData.isAbstract) {
                classData.methods.forEach(method => {
                    if (this.validateTargetType(classData.targetClass, types)) {
                        this.buildService(classData, method);
                    }
                });
            }
        });
        InternalServer.pathsResolved = true;
        this.handleNotAllowedMethods();
    }

    async runPreprocessors(processors: Array<Function>, req: express.Request): Promise<express.Request> {
        let request = req;
        for (const processor of processors) {
            request = await Promise.resolve(processor(request));
        }
        return request;
    }

    buildService(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod) {
        const handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (serviceMethod.processors || serviceClass.processors) {
                serviceClass.processors = serviceClass.processors || [];
                serviceMethod.processors = serviceMethod.processors || [];
                this.runPreprocessors(serviceClass.processors.concat(serviceMethod.processors), req).then((request) => this.callTargetEndPoint(serviceClass, serviceMethod, request, res, next)).catch((err: any) => next(err));
            } else {
                this.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
            }
        };

        if (!serviceMethod.resolvedPath) {
            InternalServer.resolveProperties(serviceClass, serviceMethod);
        }

        const middleware: Array<express.RequestHandler> = this.buildServiceMiddleware(serviceMethod);
        let args: any[] = [serviceMethod.resolvedPath];
        args = args.concat(middleware);
        args.push(handler);
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

    private static getServiceClass(target: Function): metadata.ServiceClass {
        target = InternalServer.serviceFactory.getTargetClass(target);
        return InternalServer.serverClasses.get(target['name'] || target.constructor['name']) || null;
    }

    private validateTargetType(targetClass: Function, types: Array<Function>): boolean {
        if (types && types.length > 0) {
            return (types.indexOf(targetClass) > -1);
        }
        return true;
    }

    private handleNotAllowedMethods() {
        const paths: Set<string> = InternalServer.getPaths();
        paths.forEach((path) => {
            const supported: Set<HttpMethod> = InternalServer.getHttpMethods(path);
            const allowedMethods: Array<string> = new Array<string>();
            supported.forEach((method: HttpMethod) => {
                allowedMethods.push(HttpMethod[method]);
            });
            const allowed: string = allowedMethods.join(', ');
            this.router.all(path, (req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.set('Allow', allowed);
                throw new Errors.MethodNotAllowedError();
            });
        });
    }

    private getUploader(): multer.Instance {
        if (!this.upload) {
            const options: multer.Options = {};
            if (InternalServer.fileDest) {
                options.dest = InternalServer.fileDest;
            }
            if (InternalServer.fileFilter) {
                options.fileFilter = InternalServer.fileFilter;
            }
            if (InternalServer.fileLimits) {
                options.limits = InternalServer.fileLimits;
            }
            if (options.dest) {
                this.upload = multer(options);
            } else {
                this.upload = multer();
            }
        }
        return this.upload;
    }

    private buildServiceMiddleware(serviceMethod: metadata.ServiceMethod): Array<express.RequestHandler> {
        const result: Array<express.RequestHandler> = new Array<express.RequestHandler>();

        if (serviceMethod.mustParseCookies) {
            const args = [];
            if (InternalServer.cookiesSecret) {
                args.push(InternalServer.cookiesSecret);
            }
            if (InternalServer.cookiesDecoder) {
                args.push({ decode: InternalServer.cookiesDecoder });
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
                context.language = <string>lang;
            }
        } else {
            const languages: string[] = context.request.acceptsLanguages();
            if (languages && languages.length > 0) {
                context.language = languages[0];
            }
        }

        if (serviceMethod.resolvedAccepts) {
            const accept: any = context.request.accepts(serviceMethod.resolvedAccepts);
            if (accept) {
                context.accept = <string>accept;
            } else {
                throw new Errors.NotAcceptableError('Accept');
            }
        }

        if (!context.language) {
            throw new Errors.NotAcceptableError('Accept-Language');
        }
    }

    private createService(serviceClass: metadata.ServiceClass, context: ServiceContext) {
        const serviceObject = InternalServer.serviceFactory.create(serviceClass.targetClass);
        if (serviceClass.hasProperties()) {
            serviceClass.properties.forEach((property, key) => {
                serviceObject[key] = this.processParameter(property.type, context, property.name, property.propertyType);
            });
        }
        return serviceObject;
    }

    private callTargetEndPoint(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod,
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
        this.sendValue(result, res, next);
    }

    private sendValue(value: any, res: express.Response, next: express.NextFunction) {
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
                    res.download(value.filePath, value.fileName);
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
                        this.sendValue(value.body, res, next);
                    } else {
                        res.sendStatus(value.statusCode);
                    }

                } else if (value.then && value.catch) {
                    Promise.resolve(value)
                    .then((val: any) => {
                        this.sendValue(val, res, next);
                        return null;
                    }).catch((err: any) => {
                        next(err);
                    });
                } else {
                    res.json(value);
                }
        }
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
                const files: Array<Express.Multer.File> = context.request.files?context.request.files[name]:null;
                if (files && files.length > 0) {
                    return files[0];
                }
                return null;
            case metadata.ParamType.files:
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
                throw Error('Invalid parameter type');
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
                return InternalServer.paramConverter(paramValue, paramType);
        }
    }

    static resolveAllPaths() {
        if (!InternalServer.pathsResolved) {
            InternalServer.paths.clear();
            InternalServer.serverClasses.forEach(classData => {
                classData.methods.forEach(method => {
                    if (!method.resolvedPath) {
                        InternalServer.resolveProperties(classData, method);
                    }
                });
            });
            InternalServer.pathsResolved = true;
        }
    }

    static getPaths(): Set<string> {
        InternalServer.resolveAllPaths();
        const result = new Set<string>();
        InternalServer.paths.forEach((value, key) => {
            result.add(key);
        });
        return result;
    }

    static getHttpMethods(path: string): Set<HttpMethod> {
        InternalServer.resolveAllPaths();
        const methods: Set<HttpMethod> = InternalServer.paths.get(path);
        return methods || new Set<HttpMethod>();
    }

    private static resolveLanguages(serviceClass: metadata.ServiceClass,
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

    private static resolveAccepts(serviceClass: metadata.ServiceClass,
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

    private static resolveProperties(serviceClass: metadata.ServiceClass,
        serviceMethod: metadata.ServiceMethod): void {
        InternalServer.resolveLanguages(serviceClass, serviceMethod);
        InternalServer.resolveAccepts(serviceClass, serviceMethod);
        InternalServer.resolvePath(serviceClass, serviceMethod);
    }

    private static resolvePath(serviceClass: metadata.ServiceClass,
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

        let declaredHttpMethods: Set<HttpMethod> = InternalServer.paths.get(resolvedPath);
        if (!declaredHttpMethods) {
            declaredHttpMethods = new Set<HttpMethod>();
            InternalServer.paths.set(resolvedPath, declaredHttpMethods);
        }
        if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
            throw Error(`Duplicated declaration for path [${resolvedPath}], method [${serviceMethod.httpMethod}].`);
        }
        declaredHttpMethods.add(serviceMethod.httpMethod);
        serviceMethod.resolvedPath = resolvedPath;
    }
}
