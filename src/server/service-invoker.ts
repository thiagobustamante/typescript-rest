'use strict';

import * as express from 'express';
import * as _ from 'lodash';
import { Errors } from '../typescript-rest';
import { ParamType, ServiceClass, ServiceMethod, ServiceProperty } from './model/metadata';
import { DownloadBinaryData, DownloadResource } from './model/return-types';
import { HttpMethod, ParameterConverter, ReferencedResource, ServiceContext, ServicePreProcessor } from './model/server-types';
import { ServerContainer } from './server-container';

export class ServiceInvoker {
    private static defaultParamConverter: ParameterConverter = (p: any) => p;
    private serviceClass: ServiceClass;
    private serviceMethod: ServiceMethod;
    private preProcessors: Array<ServicePreProcessor>;

    constructor(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
        this.serviceClass = serviceClass;
        this.serviceMethod = serviceMethod;
        this.preProcessors = _.union(serviceMethod.preProcessors, serviceClass.preProcessors);
    }

    public async callService(context: ServiceContext) {
        try {
            await this.callTargetEndPoint(context);
            context.next();
        }
        catch (err) {
            context.next(err);
        }
    }

    private async runPreprocessors(context: ServiceContext): Promise<void> {
        for (const processor of this.preProcessors) {
            await Promise.resolve(processor(context.request));
        }
    }

    private async callTargetEndPoint(context: ServiceContext) {
        this.checkAcceptance(context);
        await this.runPreprocessors(context);
        const serviceObject = this.createService(context);
        const args = this.buildArgumentsList(context);
        const toCall = this.getMethodToCall();
        const result = toCall.apply(serviceObject, args);
        this.processResponseHeaders(context);
        await this.sendValue(result, context);
    }

    private getMethodToCall() {
        return this.serviceClass.targetClass.prototype[this.serviceMethod.name]
            || this.serviceClass.targetClass[this.serviceMethod.name];
    }

    private checkAcceptance(context: ServiceContext): void {
        this.identifyAcceptedLanguage(context);
        this.identifyAcceptedType(context);

        if (!context.accept) {
            throw new Errors.NotAcceptableError('Accept');
        }
        if (!context.language) {
            throw new Errors.NotAcceptableError('Accept-Language');
        }
    }

    private identifyAcceptedLanguage(context: ServiceContext) {
        if (this.serviceMethod.resolvedLanguages) {
            const lang: any = context.request.acceptsLanguages(this.serviceMethod.resolvedLanguages);
            if (lang) {
                context.language = lang as string;
            }
        } else {
            const languages: Array<string> = context.request.acceptsLanguages();
            if (languages && languages.length > 0) {
                context.language = languages[0];
            }
        }
    }

    private identifyAcceptedType(context: ServiceContext) {
        if (this.serviceMethod.resolvedAccepts) {
            context.accept = context.request.accepts(this.serviceMethod.resolvedAccepts) as string;
        } else {
            const accepts: Array<string> = context.request.accepts();
            if (accepts && accepts.length > 0) {
                context.accept = accepts[0];
            }
        }
    }

    private createService(context: ServiceContext) {
        const serviceObject = ServerContainer.get().serviceFactory.create(this.serviceClass.targetClass, context);
        if (this.serviceClass.hasProperties()) {
            this.serviceClass.properties.forEach((property, key) => {
                serviceObject[key] = this.processParameter(context, property);
            });
        }
        return serviceObject;
    }

    private buildArgumentsList(context: ServiceContext) {
        const result: Array<any> = new Array<any>();

        this.serviceMethod.parameters.forEach(param => {
            result.push(this.processParameter(context, {
                name: param.name,
                propertyType: param.type,
                type: param.paramType
            }));
        });

        return result;
    }

    private processParameter(context: ServiceContext, property: ServiceProperty) {
        switch (property.type) {
            case ParamType.path:
                return this.convertType(context.request.params[property.name], property.propertyType);
            case ParamType.query:
                return this.convertType(context.request.query[property.name], property.propertyType);
            case ParamType.header:
                return this.convertType(context.request.header(property.name), property.propertyType);
            case ParamType.cookie:
                return this.convertType(context.request.cookies[property.name], property.propertyType);
            case ParamType.body:
                return this.convertType(context.request.body, property.propertyType);
            case ParamType.file:
                // @ts-ignore
                const files: Array<Express.Multer.File> = context.request.files ? context.request.files[property.name] : null;
                if (files && files.length > 0) {
                    return files[0];
                }
                return null;
            case ParamType.files:
                // @ts-ignore
                return context.request.files[property.name];
            case ParamType.form:
                return this.convertType(context.request.body[property.name], property.propertyType);
            case ParamType.param:
                const paramValue = context.request.body[property.name] ||
                    context.request.query[property.name];
                return this.convertType(paramValue, property.propertyType);
            case ParamType.context:
                return context;
            case ParamType.context_request:
                return context.request;
            case ParamType.context_response:
                return context.response;
            case ParamType.context_next:
                return context.next;
            case ParamType.context_accept:
                return context.accept;
            case ParamType.context_accept_language:
                return context.language;
            default:
                throw new Errors.BadRequestError('Invalid parameter type');
        }
    }

    private convertType(paramValue: string | boolean, paramType: Function): any {
        const serializedType = paramType['name'];
        switch (serializedType) {
            case 'Number':
                return paramValue === undefined ? paramValue : parseFloat(paramValue as string);
            case 'Boolean':
                return paramValue === undefined ? paramValue : paramValue === 'true' || paramValue === true;
            default:
                let converter = ServerContainer.get().paramConverters.get(paramType);
                if (!converter) {
                    converter = ServiceInvoker.defaultParamConverter;
                }

                return converter(paramValue);
        }
    }

    private processResponseHeaders(context: ServiceContext) {
        if (this.serviceMethod.resolvedLanguages) {
            if (this.serviceMethod.httpMethod === HttpMethod.GET) {
                context.response.vary('Accept-Language');
            }
            context.response.set('Content-Language', context.language);
        }
        if (this.serviceMethod.resolvedAccepts) {
            if (this.serviceMethod.httpMethod === HttpMethod.GET) {
                context.response.vary('Accept');
            }
        }
    }

    private async sendValue(value: any, context: ServiceContext) {
        switch (typeof value) {
            case 'number':
                context.response.send(value.toString());
                break;
            case 'string':
                context.response.send(value);
                break;
            case 'boolean':
                context.response.send(value.toString());
                break;
            case 'undefined':
                if (!context.response.headersSent) {
                    context.response.sendStatus(204);
                }
                break;
            default:
                if (value.filePath && value instanceof DownloadResource) {
                    await this.downloadResToPromise(context.response, value);
                } else if (value instanceof DownloadBinaryData) {
                    if (value.fileName) {
                        context.response.writeHead(200, {
                            'Content-Length': value.content.length,
                            'Content-Type': value.mimeType,
                            'Content-disposition': 'attachment;filename=' + value.fileName
                        });
                    } else {
                        context.response.writeHead(200, {
                            'Content-Length': value.content.length,
                            'Content-Type': value.mimeType
                        });
                    }
                    context.response.end(value.content);
                } else if (value.location && value instanceof ReferencedResource) {
                    context.response.set('Location', value.location);
                    if (value.body) {
                        context.response.status(value.statusCode);
                        await this.sendValue(value.body, context);
                    } else {
                        context.response.sendStatus(value.statusCode);
                    }
                } else if (value.then && value.catch) {
                    const val = await value;
                    await this.sendValue(val, context);
                } else {
                    context.response.json(value);
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
}
