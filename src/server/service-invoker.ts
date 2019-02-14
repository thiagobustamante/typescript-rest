'use strict';

import * as express from 'express';
import * as _ from 'lodash';
import { Errors } from '../typescript-rest';
import { ServiceClass, ServiceMethod, ServiceProperty } from './model/metadata';
import { DownloadBinaryData, DownloadResource, NoResponse } from './model/return-types';
import { HttpMethod, ReferencedResource, ServiceContext, ServicePreProcessor } from './model/server-types';
import { ParameterProcessor } from './parameter-processor';
import { ServerContainer } from './server-container';

export class ServiceInvoker {
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
            if (this.mustCallNext()) {
                context.next();
            }
        }
        catch (err) {
            context.next(err);
        }
    }

    private mustCallNext() {
        return !this.serviceMethod.ignoreNextMiddlewares && !this.serviceClass.ignoreNextMiddlewares;
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
        return ParameterProcessor.get().processParameter(context, property);
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
        if (value !== NoResponse) {
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
                    await this.sendComplexValue(context, value);
            }
        }
    }

    private async sendComplexValue(context: ServiceContext, value: any) {
        if (value.filePath && value instanceof DownloadResource) {
            await this.downloadResToPromise(context.response, value);
        }
        else if (value instanceof DownloadBinaryData) {
            this.sendFile(context, value);
        }
        else if (value.location && value instanceof ReferencedResource) {
            await this.sendReferencedResource(context, value);
        }
        else if (value.then && value.catch) {
            const val = await value;
            await this.sendValue(val, context);
        }
        else {
            context.response.json(value);
        }
    }

    private async sendReferencedResource(context: ServiceContext, value: ReferencedResource<any>) {
        context.response.set('Location', value.location);
        if (value.body) {
            context.response.status(value.statusCode);
            await this.sendValue(value.body, context);
        }
        else {
            context.response.sendStatus(value.statusCode);
        }
    }

    private sendFile(context: ServiceContext, value: DownloadBinaryData) {
        if (value.fileName) {
            context.response.writeHead(200, {
                'Content-Length': value.content.length,
                'Content-Type': value.mimeType,
                'Content-disposition': 'attachment;filename=' + value.fileName
            });
        }
        else {
            context.response.writeHead(200, {
                'Content-Length': value.content.length,
                'Content-Type': value.mimeType
            });
        }
        context.response.end(value.content);
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
