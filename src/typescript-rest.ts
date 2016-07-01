/// <reference path="../typings/index.d.ts" />
"use strict";

import * as express from "express"; 
import * as bodyParser from "body-parser"; 
import * as cookieParser from "cookie-parser";
import "reflect-metadata"

export function Path(path: string) {
    return function (...args: any[]) {
	    if (args.length == 1) {
	        return PathTypeDecorator.apply(this, [args[0], path]);
	    }
	    else if (args.length == 3 && typeof args[2] === "object") {
	        return PathMethodDecorator.apply(this, [args[0], args[1], args[2], path]);
	    }

	    throw new Error("Invalid @Path Decorator declaration.");
	}
}

export function AcceptLanguage(...languages: string[]) {
    return function (...args: any[]) {
	    if (args.length == 1) {
	        return AcceptLanguageTypeDecorator.apply(this, [args[0], languages]);
	    }
	    else if (args.length == 3 && typeof args[2] === "object") {
	        return AcceptLanguageMethodDecorator.apply(this, [args[0], args[1], args[2], languages]);
	    }

	    throw new Error("Invalid @Accept Decorator declaration.");
	}
}

export function Context(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([ParamType.context]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([ParamType.context, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}

export function ContextRequest(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([ParamType.context_request]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([ParamType.context_request, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}

export function ContextResponse(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([ParamType.context_response]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([ParamType.context_response, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}

export function ContextNext(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([ParamType.context_next]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([ParamType.context_next, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}

export function ContextLanguage(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([ParamType.context_accept_language]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([ParamType.context_accept_language, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}


export function GET(target: any, propertyKey: string,
	descriptor: PropertyDescriptor){
    processHttpVerb(target, propertyKey, HttpMethod.GET);
}

export function POST(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.POST);
}

export function PUT(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PUT);
}

export function DELETE(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.DELETE);
}

export function HEAD(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.HEAD);
}

export function OPTIONS(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.OPTIONS);
}

export function PATCH(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PATCH);
}

export function PathParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.path, name);
	}
}

export function QueryParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.query, name);
	}
}

export function HeaderParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.header, name);
	}
}

export function CookieParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.cookie, name);
	}
}

export function FormParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.form, name);
	}
}

export class ServiceContext {
	language: string;
	request: express.Request;
	response: express.Response; 
	next: express.NextFunction;
}

export enum HttpMethod {
	GET,
	POST,
	PUT,
	DELETE,
	HEAD,
	OPTIONS,
	PATCH
}

export abstract class Server {
	static buildServices(router: express.Router) {
		let iternalServer: InternalServer = new InternalServer(router);
		iternalServer.buildServices();
	}

	static getPaths(): Set<string> {
		return InternalServer.getPaths();
	}

	static getHttpMethods(path: string): Set<HttpMethod> {
		return InternalServer.getHttpMethods(path);
	}

	static setCookiesSecret(secret: string) {
		InternalServer.cookiesSecret = secret;
	}

	static setCookiesDecoder(decoder: Function) {
		InternalServer.cookiesDecoder = decoder;
	}
}

/**
 * Decorator processor for [[Path]] decorator on classes
 */
function AcceptLanguageTypeDecorator(target: Function, languages: string[]) {
	let classData: ServiceClass = InternalServer.registerServiceClass(target);
	classData.languages = languages;
}

/**
 * Decorator processor for [[Path]] decorator on methods
 */
function AcceptLanguageMethodDecorator(target: any, propertyKey: string, 
			descriptor: PropertyDescriptor, languages: string[]) {
	let serviceMethod: ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		serviceMethod.languages = languages;
    }
}


/**
 * Decorator processor for [[Path]] decorator on classes
 */
function PathTypeDecorator(target: Function, path: string) {
	let classData: ServiceClass = InternalServer.registerServiceClass(target);
	classData.path = path;
}

/**
 * Decorator processor for [[Path]] decorator on methods
 */
function PathMethodDecorator(target: any, propertyKey: string, 
			descriptor: PropertyDescriptor, path: string) {
	let serviceMethod: ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		serviceMethod.path = path;
    }
}

/**
 * Decorator processor for parameter annotations on methods
 */
function processDecoratedParameter(target: Object, propertyKey: string, parameterIndex: number, 
	paramType: ParamType, name: string) {
	let serviceMethod: ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
	if (serviceMethod) { // does not intercept constructor
		let paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);

		while (serviceMethod.parameters.length < paramTypes.length) {
			serviceMethod.parameters.push(new MethodParam(null, 
						paramTypes[serviceMethod.parameters.length], ParamType.body));
		}
		serviceMethod.parameters[parameterIndex] = new MethodParam(name, paramTypes[parameterIndex], paramType);
	}
}

function processDecoratedProperty(target: Function, key: string, paramType: ParamType) {
	let classData: ServiceClass = InternalServer.registerServiceClass(target.constructor);
    classData.addProperty(key, paramType);
}


/**
 * Decorator processor for HTTP verb annotations on methods
 */
function processHttpVerb(target: any, propertyKey: string,
	httpMethod: HttpMethod) {
	let serviceMethod: ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		if (serviceMethod.httpMethod) {
			throw new Error("Method is already annotated with @" +
				serviceMethod.httpMethod +
				". You can only map a method to one HTTP verb.");
		}
		serviceMethod.httpMethod = httpMethod;
		processServiceMethod(target, propertyKey, serviceMethod);
    }
}

/**
 * extract metadata for rest methods
 */
function processServiceMethod(target: any, propertyKey: string, serviceMethod: ServiceMethod) {
	serviceMethod.name = propertyKey;
	serviceMethod.returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
	let paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
	while (paramTypes.length > serviceMethod.parameters.length) {
		serviceMethod.parameters.push(new MethodParam(null,
			paramTypes[serviceMethod.parameters.length], ParamType.body));
	}

	serviceMethod.parameters.forEach(param => {
		if (param.paramType == ParamType.cookie) {
			serviceMethod.mustParseCookies = true;
		}
		else if (param.paramType == ParamType.form) {
			if (serviceMethod.mustParseBody) {
				throw Error("Can not use form parameters with a body parameter on the same method.");
			}
			serviceMethod.mustParseForms = true;
		}
		else if (param.paramType == ParamType.body) {
			if (serviceMethod.mustParseForms) {
				throw Error("Can not use form parameters with a body parameter on the same method.");
			}
			if (serviceMethod.mustParseBody) {
				throw Error("Can not use more than one body parameter on the same method.");
			}
			serviceMethod.mustParseBody = true;
		}
	});
}

/**
 * Metadata for REST service classes
 */
class ServiceClass {
	constructor(targetClass: Function) {
		this.targetClass = targetClass;
		this.methods = new Map<string, ServiceMethod>();
	}

	targetClass: Function;
	path: string;
	methods: Map<string, ServiceMethod>;
	languages: Array<string>;
	properties: Map<string, ParamType>;
	
	addProperty(key: string, paramType: ParamType) {
		if (!this.hasProperties()) {
			this.properties = new Map<string, ParamType>();
		}
		this.properties.set(key, paramType);
	}

	hasProperties(): boolean {
		return (this.properties && this.properties.size > 0);
	}
}

/**
 * Metadata for REST service methods
 */
class ServiceMethod {
	name: string;
	path: string;
	resolvedPath: string;
	httpMethod: HttpMethod;
	returnType: Function;
	parameters: Array<MethodParam> = new Array<MethodParam>();
	mustParseCookies: boolean = false;
	mustParseBody: boolean = false;
	mustParseForms: boolean = false;
	languages: Array<string>;
	resolvedLanguages: Array<string>;
}

/**
 * Metadata for REST service method parameters
 */
class MethodParam {
	constructor(name: string, type: Function, paramType: ParamType) {
		this.name = name;
		this.type = type;
		this.paramType = paramType;
	}

	name: string;
	type: Function;
	paramType: ParamType;
}

enum ParamType {
	path,
	query,
	header,
	cookie,
	form,
	body,
	context,
	context_request,
	context_response,
	context_next, 
	context_accept_language
}

class InternalServer {
	static serverClasses: Map<string, ServiceClass> = new Map<string, ServiceClass>();
	static paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
	static pathsResolved: boolean = false;
	static cookiesSecret: string;
	static cookiesDecoder: Function;

	router: express.Router;

	constructor(router: express.Router) {
		this.router = router;
	 }

	static registerServiceClass(target: Function): ServiceClass {
		InternalServer.pathsResolved = false;
		let name: string = target.name || target.constructor.name;
		if (!InternalServer.serverClasses.has(name)) {
			InternalServer.serverClasses.set(name, new ServiceClass(target));
		}
		let serviceClass: ServiceClass = InternalServer.serverClasses.get(name);
		return serviceClass;
	}

	static registerServiceMethod(target: Function, methodName: string): ServiceMethod {
		if (methodName) {
			InternalServer.pathsResolved = false;
			let classData: ServiceClass = InternalServer.registerServiceClass(target);
			if (!classData.methods.has(methodName)) {
				classData.methods.set(methodName, new ServiceMethod());
			}
			let serviceMethod: ServiceMethod = classData.methods.get(methodName);
			return serviceMethod;
		}
		return null;
	}

	buildServices() {
		InternalServer.serverClasses.forEach(classData => { 
			classData.methods.forEach(method => {
				this.buildService(classData, method);
			});
		});
		InternalServer.pathsResolved = true;
	}

	buildService(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
		let handler = (req, res, next) => {
			this.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
		};

		if (!serviceMethod.resolvedPath) {
			InternalServer.resolveProperties(serviceClass, serviceMethod);
		}

		let middleware: Array<express.RequestHandler> = this.buildServiceMiddleware(serviceMethod);
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
				throw Error("Invalid http method for service [" + serviceMethod.resolvedPath + "]");
		 }
	}

	private buildServiceMiddleware(serviceMethod: ServiceMethod): Array<express.RequestHandler> {
		let result: Array<express.RequestHandler> = new Array<express.RequestHandler>();

		if (serviceMethod.mustParseCookies) {
			let args = [];
			if (InternalServer.cookiesSecret) {
				args.push(InternalServer.cookiesSecret);
			}
			if (InternalServer.cookiesDecoder){
				args.push({ decode: InternalServer.cookiesDecoder });
			}
			result.push(cookieParser.apply(this, args));
		}
		if (serviceMethod.mustParseBody) {
			result.push(bodyParser.json());
			//TODO adicionar parser de XML para o body
		}
		if (serviceMethod.mustParseForms) {
			result.push(bodyParser.urlencoded({ extended: true }));
			//TODO adicionar o multer para parsing arquivos
		}

		return result;
	}

	private processResponseHeaders(serviceMethod: ServiceMethod, context: ServiceContext) {
		if (serviceMethod.resolvedLanguages) {
			if (serviceMethod.httpMethod === HttpMethod.GET) {
				context.response.vary("Accept-Language");
			}
			context.response.set("Content-Language", context.language);
		}
	}

	private acceptable(serviceMethod: ServiceMethod, context: ServiceContext) : boolean {
		if (serviceMethod.resolvedLanguages) {
			 let lang: any = context.request.acceptsLanguages(serviceMethod.resolvedLanguages);
			 if (lang) {
				 context.language = <string> lang;
			 }
		}
		else {
			 let languages: string[] = context.request.acceptsLanguages();
			 if (languages && languages.length > 0) {
				 context.language = languages[0];
			 }
		}

		if (!context.language) {
			return false;
		}
		return true;
	}

	private createService(serviceClass: ServiceClass, context: ServiceContext) {
		let serviceObject = Object.create(serviceClass.targetClass);
		if (serviceClass.hasProperties()) {
			serviceClass.properties.forEach((paramType, key) => {
				switch (paramType) {
					case ParamType.context:
						serviceObject[key] = context;
						break;
					case ParamType.context_accept_language:
						serviceObject[key] = context.language;
						break;
					case ParamType.context_request:
						serviceObject[key] = context.request;
						break;
					case ParamType.context_response:
						serviceObject[key] = context.response;
						break;
					case ParamType.context_next:
						serviceObject[key] = context.next;
						break;
					default:
						break;
				}
			})
		}
		return serviceObject;
	}

	private callTargetEndPoint(serviceClass: ServiceClass, serviceMethod: ServiceMethod, 
		req: express.Request, res: express.Response, next: express.NextFunction) {
		let context: ServiceContext = new ServiceContext();
		context.request = req;
		context.response = res;
		context.next = next;

		if (this.acceptable(serviceMethod, context)) {
			let serviceObject = this.createService(serviceClass, context);
			let args = this.buildArgumentsList(serviceMethod, context);
			let result = serviceClass.targetClass.prototype[serviceMethod.name].apply(serviceObject, args);

			this.processResponseHeaders(serviceMethod, context);

			if (serviceMethod.returnType) {
				let serializedType = serviceMethod.returnType.name;
				switch (serializedType) {
					case "String":
						res.send(result);
						break;
					case "Number":
						res.send(result.toString());
						break;
					case "Boolean":
						res.send(result.toString());
						break;
					case "Promise":
						let self = this;
						result.then(function(value) {
							self.sendValue(value, res);
						}).catch(function(e){
							if (!res.headersSent) {
								res.sendStatus(500);
							}
						});
						break;
					case "undefined":
						res.sendStatus(204);
						break;
					default:
						res.json(result);
						break;
				}
			}
			else {
				this.sendValue(result, res);
			}
		}
		else {
			res.sendStatus(406);
		}
	}

	private sendValue(value: any, res: express.Response) {
		switch (typeof value) {
			case "number":
				res.send(value.toString());
				break;
			case "string":
				res.send(value);
				break;
			case "boolean":
				res.send(value.toString());
				break;
			case "undefined":
				if (!res.headersSent) {
					res.sendStatus(204);
				}
				break;
			default:
				if (value.constructor.name == "Promise") {
					let self = this;
					value.then(function(val) {
						self.sendValue(val, res);
					}).catch(function(e) {
						if (!res.headersSent) {
							res.sendStatus(500);
						}
					});
				}
				else {
					res.json(value);
				}
		}
	}

	private buildArgumentsList(serviceMethod: ServiceMethod, context: ServiceContext) {
		let result: Array<any> = new Array<any>();

		serviceMethod.parameters.forEach(param => {
			switch (param.paramType) {
				case ParamType.path:
					result.push(this.convertType(context.request.params[param.name], param.type));
					break;
				case ParamType.query:
					result.push(this.convertType(context.request.query[param.name], param.type));
					break;
				case ParamType.header:
					result.push(this.convertType(context.request.header(param.name), param.type));
					break;
				case ParamType.cookie:
					result.push(this.convertType(context.request.cookies[param.name], param.type));
					break;
				case ParamType.body:
					result.push(this.convertType(context.request.body, param.type));
					//TODO parser situacao onde tem arquivo mais outros campos, ver o multer
					break;
				case ParamType.form:
					result.push(this.convertType(context.request.body[param.name], param.type));
					break;
				case ParamType.context:
					result.push(context);
					break;
				case ParamType.context_request:
					result.push(context.request);
					break;
				case ParamType.context_response:
					result.push(context.response);
					break;
				case ParamType.context_next:
					result.push(context.next);
					break;
				case ParamType.context_accept_language:
					result.push(context.language);
					break;
				default:
					throw Error("Invalid parameter type");
			}
		});

		return result;
	}

	private convertType(paramValue: string, paramType: Function): any {
		let serializedType = paramType.name;
		switch (serializedType) {
			case "Number":
				return paramValue ? parseFloat(paramValue) : 0;
			case "Boolean":
				return paramValue === 'true';
			default:
				return paramValue;
		}
	}

//TODO: 
// service Logs customizavel
//Parametros do tipo DTO (@BeanParam). 
// criar uma anotacao para arquivos e tipo de retorno para donwload???
// Anotacoes para accepts / acceptCharset
// controlar cache
// compressao gzip
// Suportar um procesador de cabecalhos
// conditional requests
// Suportar content-type XML (input e output)
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
		return new Set(InternalServer.paths.keys());
	}

	static getHttpMethods(path: string) : Set<HttpMethod>{
		InternalServer.resolveAllPaths();
		let methods : Set<HttpMethod>  = InternalServer.paths.get(path);
		return methods || new Set<HttpMethod>();
	}

	private static resolveLanguages(serviceClass: ServiceClass, serviceMethod: ServiceMethod) : void {
		let resolvedLanguages = new Array<string>();
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

	private static resolveProperties(serviceClass: ServiceClass, serviceMethod: ServiceMethod) : void {
		InternalServer.resolveLanguages(serviceClass, serviceMethod);
		InternalServer.resolvePath(serviceClass, serviceMethod);
	}

	private static resolvePath(serviceClass: ServiceClass, serviceMethod: ServiceMethod) : void {
		let classPath: string = serviceClass.path ? serviceClass.path.trim() : "";
		let resolvedPath = classPath.startsWith('/') ? classPath : '/' + classPath;
		if (resolvedPath.endsWith('/')) {
			resolvedPath = resolvedPath.slice(0, resolvedPath.length - 1);
		}

		if (serviceMethod.path) {
			let methodPath: string = serviceMethod.path.trim();
			resolvedPath = classPath + (methodPath.startsWith('/') ? methodPath : '/' + methodPath);
		}

		let declaredHttpMethods: Set<HttpMethod> = InternalServer.paths.get(resolvedPath);
		if (!declaredHttpMethods) {
			declaredHttpMethods = new Set<HttpMethod>();
			InternalServer.paths.set(resolvedPath, declaredHttpMethods);
		}
		if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
			throw Error("Duplicated declaration for path [" + resolvedPath + "], method [" 
				+ serviceMethod.httpMethod + "]. ");
		}
		declaredHttpMethods.add(serviceMethod.httpMethod);
		serviceMethod.resolvedPath = resolvedPath;
	}
}
