'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import * as metadata from '../metadata';
import { ServerContainer } from '../server/server-container';

export class ParameterDecorator {
    private decorator: string;
    private paramType: metadata.ParamType;
    private nameRequired: boolean = false;
    private name: string = null;

    constructor(decorator: string) {
        this.decorator = decorator;
    }

    public withType(paramType: metadata.ParamType) {
        this.paramType = paramType;
        return this;
    }

    public withName(name: string) {
        this.nameRequired = true;
        this.name = name ? name.trim() : '';
        return this;
    }

    public decorateParameterOrProperty(args: Array<any>) {
        if (!this.nameRequired || this.name) {
            args = _.without(args, undefined);
            if (args.length < 3 || typeof args[2] === 'undefined') {
                return this.decorateProperty(args[0], args[1]);
            } else if (args.length === 3 && typeof args[2] === 'number') {
                return this.decorateParameter(args[0], args[1], args[2]);
            }
        }

        throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
    }

    public decorateNamedParameterOrProperty() {
        return (...args: Array<any>) => {
            return this.decorateParameterOrProperty(args);
        };
    }

    private decorateParameter(target: Object, propertyKey: string, parameterIndex: number) {
        const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey);

            while (paramTypes && serviceMethod.parameters.length < paramTypes.length) {
                serviceMethod.parameters.push(new metadata.MethodParam(null,
                    paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
            }
            serviceMethod.parameters[parameterIndex] =
                new metadata.MethodParam(this.name, paramTypes[parameterIndex], this.paramType);
        }
    }

    private decorateProperty(target: Function, key: string) {
        const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(target.constructor);
        const propertyType = Reflect.getMetadata('design:type', target, key);
        classData.addProperty(key, this.paramType, this.name, propertyType);
    }
}




