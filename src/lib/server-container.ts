/// <reference path="../../typings/index.d.ts" />
"use strict";

import * as express from "express"; 
import * as bodyParser from "body-parser"; 
import * as cookieParser from "cookie-parser";
import * as multer from "multer";
import * as metadata from "./metadata";
import {HttpMethod, ServiceContext} from "./server-types";

export class InternalServer {
	static serverClasses: Map<string, metadata.ServiceClass> = new Map<string, metadata.ServiceClass>();
	static paths: Map<string, Set<HttpMethod>> = new Map<string, Set<HttpMethod>>();
	static pathsResolved: boolean = false;
	static cookiesSecret: string;
	static cookiesDecoder: (val: string) => string;
	static fileDest: string;
	static fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void;
	static fileLimits: number;

	router: express.Router;
	upload: multer.Instance; 

	constructor(router: express.Router) {
		this.router = router;
	 }

	static registerServiceClass(target: Function): metadata.ServiceClass {
		InternalServer.pathsResolved = false;
		let name: string = target.name || target.constructor.name;
		if (!InternalServer.serverClasses.has(name)) {
			InternalServer.serverClasses.set(name, new metadata.ServiceClass(target));
		}
		let serviceClass: metadata.ServiceClass = InternalServer.serverClasses.get(name);
		return serviceClass;
	}

	static registerServiceMethod(target: Function, methodName: string): metadata.ServiceMethod {
		if (methodName) {
			InternalServer.pathsResolved = false;
			let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
			if (!classData.methods.has(methodName)) {
				classData.methods.set(methodName, new metadata.ServiceMethod());
			}
			let serviceMethod: metadata.ServiceMethod = classData.methods.get(methodName);
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

	buildService(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod) {
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

	private getUploader(): multer.Instance {
		if (!this.upload) {
			let options : multer.Options= {};
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
			}
			else {
				this.upload = multer();
			}
		}
		return this.upload;
	} 

	private buildServiceMiddleware(serviceMethod: metadata.ServiceMethod): Array<express.RequestHandler> {
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
		}
		if (serviceMethod.files.length > 0) {
			let options: Array<multer.Field> = new Array<multer.Field>();
			serviceMethod.files.forEach(fileData => {
				if (fileData.singleFile) {
					options.push({"name": fileData.name,  "maxCount": 1});
				}
				else {
					options.push({"name": fileData.name});
				}
			});
			result.push(this.getUploader().fields(options));
		}

		return result;
	}

	private processResponseHeaders(serviceMethod: metadata.ServiceMethod, context: ServiceContext) {
		if (serviceMethod.resolvedLanguages) {
			if (serviceMethod.httpMethod === HttpMethod.GET) {
				context.response.vary("Accept-Language");
			}
			context.response.set("Content-Language", context.language);
		}
		if (serviceMethod.resolvedAccepts) {
			context.response.vary("Accept");
		}
	}

	private acceptable(serviceMethod: metadata.ServiceMethod, context: ServiceContext) : boolean {
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

		if (serviceMethod.resolvedAccepts) {
			 let accept: any = context.request.accepts(serviceMethod.resolvedAccepts);
			 if (accept) {
				 context.preferredMedia = <string> accept;
			 }
			 else {
			 	return false;
			 }
		}

		if (!context.language) {
			return false;
		}
		return true;
	}

	private createService(serviceClass: metadata.ServiceClass, context: ServiceContext) {
		let serviceObject = Object.create(serviceClass.targetClass);
		if (serviceClass.hasProperties()) {
			serviceClass.properties.forEach((paramType, key) => {
				switch (paramType) {
					case metadata.ParamType.context:
						serviceObject[key] = context;
						break;
					case metadata.ParamType.context_accept_language:
						serviceObject[key] = context.language;
						break;
					case metadata.ParamType.context_accept:
						serviceObject[key] = context.preferredMedia;
						break;
					case metadata.ParamType.context_request:
						serviceObject[key] = context.request;
						break;
					case metadata.ParamType.context_response:
						serviceObject[key] = context.response;
						break;
					case metadata.ParamType.context_next:
						serviceObject[key] = context.next;
						break;
					default:
						break;
				}
			})
		}
		return serviceObject;
	}

	private callTargetEndPoint(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod, 
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

	private buildArgumentsList(serviceMethod: metadata.ServiceMethod, context: ServiceContext) {
		let result: Array<any> = new Array<any>();

		serviceMethod.parameters.forEach(param => {
			switch (param.paramType) {
				case metadata.ParamType.path:
					result.push(this.convertType(context.request.params[param.name], param.type));
					break;
				case metadata.ParamType.query:
					result.push(this.convertType(context.request.query[param.name], param.type));
					break;
				case metadata.ParamType.header:
					result.push(this.convertType(context.request.header(param.name), param.type));
					break;
				case metadata.ParamType.cookie:
					result.push(this.convertType(context.request.cookies[param.name], param.type));
					break;
				case metadata.ParamType.body:
					result.push(this.convertType(context.request.body, param.type));
					break;
				case metadata.ParamType.file:
					let files : Array<Express.Multer.File> = context.request.files[param.name];
					if (files && files.length > 0) {
						result.push(files[0]);
					}
					break;
				case metadata.ParamType.files:
					result.push(context.request.files[param.name]);
					break;
				case metadata.ParamType.form:
					result.push(this.convertType(context.request.body[param.name], param.type));
					break;
				case metadata.ParamType.context:
					result.push(context);
					break;
				case metadata.ParamType.context_request:
					result.push(context.request);
					break;
				case metadata.ParamType.context_response:
					result.push(context.response);
					break;
				case metadata.ParamType.context_next:
					result.push(context.next);
					break;
				case metadata.ParamType.context_accept:
					result.push(context.preferredMedia);
					break;
				case metadata.ParamType.context_accept_language:
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
// Parametros do tipo DTO (@BeanParam). 
// criar tipo de retorno para donwload???
// controlar cache
// conditional requests
// Adicionar anotações para Coleções de recursos e para operações 
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

	private static resolveLanguages(serviceClass: metadata.ServiceClass, 
									serviceMethod: metadata.ServiceMethod) : void {
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

	private static resolveAccepts(serviceClass: metadata.ServiceClass, 
								  serviceMethod: metadata.ServiceMethod) : void {
		let resolvedAccepts = new Array<string>();
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
									 serviceMethod: metadata.ServiceMethod) : void {
		InternalServer.resolveLanguages(serviceClass, serviceMethod);
		InternalServer.resolveAccepts(serviceClass, serviceMethod);		
		InternalServer.resolvePath(serviceClass, serviceMethod);
	}

	private static resolvePath(serviceClass: metadata.ServiceClass, 
							   serviceMethod: metadata.ServiceMethod) : void {
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
