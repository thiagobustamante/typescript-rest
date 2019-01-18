'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import * as metadata from '../metadata';
import { HttpMethod } from '../server-types';
import { ServerContainer } from '../server/server-container';

export class MethodDecorator {
    private static PROCESSORS = getParameterProcessors();

    private httpMethod: HttpMethod;

    constructor(httpMethod: HttpMethod) {
        this.httpMethod = httpMethod;
    }

    public decorateMethod(target: Function, propertyKey: string) {
        const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            if (!serviceMethod.httpMethod) {
                serviceMethod.httpMethod = this.httpMethod;
                this.processServiceMethod(target, propertyKey, serviceMethod);
            } else if (serviceMethod.httpMethod !== this.httpMethod) {
                throw new Error('Method is already annotated with @' +
                    HttpMethod[serviceMethod.httpMethod] +
                    '. You can only map a method to one HTTP verb.');
            }
        }
    }

    /**
     * Extract metadata for rest methods
     */
    private processServiceMethod(target: any, propertyKey: string, serviceMethod: metadata.ServiceMethod) {
        serviceMethod.name = propertyKey;
        const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey);
        this.registerUndecoratedParameters(paramTypes, serviceMethod);

        serviceMethod.parameters.forEach(param => {
            const processor = MethodDecorator.PROCESSORS.get(param.paramType);
            if (processor) {
                processor(serviceMethod, param);
            }
        });
    }

    private registerUndecoratedParameters(paramTypes: any, serviceMethod: metadata.ServiceMethod) {
        while (paramTypes && paramTypes.length > serviceMethod.parameters.length) {
            serviceMethod.parameters.push(new metadata.MethodParam(null, paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
        }
    }
}

type ParamProcessor = (serviceMethod: metadata.ServiceMethod, param?: metadata.MethodParam) => void;
function getParameterProcessors() {
    const result = new Map<metadata.ParamType, ParamProcessor>();
    result.set(metadata.ParamType.cookie, (serviceMethod) => {
        serviceMethod.mustParseCookies = true;
    });
    result.set(metadata.ParamType.file, (serviceMethod, param) => {
        serviceMethod.files.push(new metadata.FileParam(param.name, true));
    });
    result.set(metadata.ParamType.files, (serviceMethod, param) => {
        serviceMethod.files.push(new metadata.FileParam(param.name, false));
    });
    result.set(metadata.ParamType.param, (serviceMethod) => {
        serviceMethod.acceptMultiTypedParam = true;
    });
    result.set(metadata.ParamType.form, (serviceMethod) => {
        if (serviceMethod.mustParseBody) {
            throw Error('Can not use form parameters with a body parameter on the same method.');
        }
        serviceMethod.mustParseForms = true;
    });
    result.set(metadata.ParamType.body, (serviceMethod) => {
        if (serviceMethod.mustParseForms) {
            throw Error('Can not use form parameters with a body parameter on the same method.');
        }
        if (serviceMethod.mustParseBody) {
            throw Error('Can not use more than one body parameter on the same method.');
        }
        serviceMethod.mustParseBody = true;
    });
    return result;
}
