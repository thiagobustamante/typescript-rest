'use strict';

import * as debug from 'debug';
import * as express from 'express';
import * as _ from 'lodash';
import { Errors } from '../typescript-rest';
import { ServiceClass, ServiceMethod, ServiceProperty } from './model/metadata';
import { DownloadBinaryData, DownloadResource, NoResponse } from './model/return-types';
import { HttpMethod, ReferencedResource, ServiceContext, ServiceProcessor } from './model/server-types';
import { ParameterProcessor } from './parameter-processor';
import { ServerContainer } from './server-container';

export class ServiceInvoker {
    private serviceClass: ServiceClass;
    private serviceMethod: ServiceMethod;
    private preProcessors: Array<ServiceProcessor>;
    private postProcessors: Array<ServiceProcessor>;
    private debugger = debug('typescript-rest:service-invoker:runtime');

    constructor(serviceClass: ServiceClass, serviceMethod: ServiceMethod) {
        this.serviceClass = serviceClass;
        this.serviceMethod = serviceMethod;
        this.preProcessors = _.union(serviceMethod.preProcessors, serviceClass.preProcessors);
        this.postProcessors = _.union(serviceMethod.postProcessors, serviceClass.postProcessors);
    }

    public async callService(context: ServiceContext) {
        try {
            await this.callTargetEndPoint(context);
            if (this.mustCallNext()) {
                context.next();
            } else if (this.debugger.enabled) {
                this.debugger('Ignoring next middlewares');
            }
        }
        catch (err) {
            context.next(err);
        }
    }

    private mustCallNext() {
        return !ServerContainer.get().ignoreNextMiddlewares &&
            !this.serviceMethod.ignoreNextMiddlewares && !this.serviceClass.ignoreNextMiddlewares;
    }

    private async runPreProcessors(context: ServiceContext): Promise<void> {
        this.debugger('Running preprocessors');
        for (const processor of this.preProcessors) {
            await Promise.resolve(processor(context.request, context.response));
        }
    }

    private async runPostProcessors(context: ServiceContext): Promise<void> {
        this.debugger('Running postprocessors');
        for (const processor of this.postProcessors) {
            await Promise.resolve(processor(context.request, context.response));
        }
    }

    private async callTargetEndPoint(context: ServiceContext) {
        this.debugger('Calling targetEndpoint %s', this.serviceMethod.resolvedPath);
        this.checkAcceptance(context);
        if (this.preProcessors.length) {
            await this.runPreProcessors(context);
        }
        const serviceObject = this.createService(context);
        const args = this.buildArgumentsList(context);
        const toCall = this.getMethodToCall();
        if (this.debugger.enabled) {
            this.debugger('Invoking service method <%s> with params: %j', this.serviceMethod.name, args);
        }
        const result = await toCall.apply(serviceObject, args);
        if (this.postProcessors.length) {
            await this.runPostProcessors(context);
        }
        this.processResponseHeaders(context);
        await this.sendValue(result, context);
    }

    private getMethodToCall() {
        return this.serviceClass.targetClass.prototype[this.serviceMethod.name]
            || this.serviceClass.targetClass[this.serviceMethod.name];
    }

    private checkAcceptance(context: ServiceContext): void {
        this.debugger('Verifying accept headers');
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
        this.debugger('Identified the preferable language accepted by server: %s', context.language);
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
        this.debugger('Identified the preferable media type accepted by server: %s', context.accept);
    }

    private createService(context: ServiceContext) {
        const serviceObject = ServerContainer.get().serviceFactory.create(this.serviceClass.targetClass, context);
        this.debugger('Creating service object');
        if (this.serviceClass.hasProperties()) {
            this.serviceClass.properties.forEach((property, key) => {
                this.debugger('Setting service property %s', key);
                serviceObject[key] = this.processParameter(context, property);
            });
        }
        return serviceObject;
    }

    private buildArgumentsList(context: ServiceContext) {
        const result: Array<any> = new Array<any>();

        this.serviceMethod.parameters.forEach(param => {
            this.debugger('Processing service parameter [%s]', param.name || 'body');
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
                this.debugger('Adding response header vary: Accept-Language');
                context.response.vary('Accept-Language');
            }
            this.debugger('Adding response header Content-Language: %s', context.language);
            context.response.set('Content-Language', context.language);
        }
        if (this.serviceMethod.resolvedAccepts) {
            if (this.serviceMethod.httpMethod === HttpMethod.GET) {
                this.debugger('Adding response header vary: Accept');
                context.response.vary('Accept');
            }
        }
    }

    private async sendValue(value: any, context: ServiceContext) {
        if (value !== NoResponse) {
            this.debugger('Sending response value: %o', value);
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
                    value === null 
                        ? context.response.send(value) 
                        : await this.sendComplexValue(context, value);
            }
        } else {
            this.debugger('Do not send any response value');
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
            this.debugger('Sending a json value: %j', value);
            context.response.json(value);
        }
    }

    private async sendReferencedResource(context: ServiceContext, value: ReferencedResource<any>) {
        this.debugger('Setting the header Location: %s', value.location);
        this.debugger('Sendinf status code: %d', value.statusCode);
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
        this.debugger('Sending file as response');
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
        this.debugger('Sending a resource to download. Path: %s', value.filePath);
        return new Promise((resolve, reject) => {
            res.download(value.filePath, value.fileName || value.filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            });
        });
    }
}
