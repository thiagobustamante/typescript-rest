'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import * as metadata from '../metadata';
import { ServerContainer } from '../server/server-container';

export class ServiceDecorator {
    private decorator: string;
    private property: string;
    private value: any;

    constructor(decorator: string) {
        this.decorator = decorator;
    }

    public withValue(value: any) {
        this.value = value;
        return this;
    }

    public withProperty(property: string) {
        this.property = property;
        return this;
    }

    public decorateTypeOrMethod() {
        return (...args: Array<any>) => {
            args = _.without(args, undefined);
            if (args.length === 1) {
                this.decorateType(args[0]);
            } else if (args.length === 3 && typeof args[2] === 'object') {
                this.decorateMethod(args[0], args[1]);
            } else {
                throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
            }
        };
    }

    private decorateType(target: Function) {
        const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(target);
        if (classData) {
            classData[this.property] = this.value;
        }
    }

    private decorateMethod(target: Function, propertyKey: string) {
        const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            serviceMethod[this.property] = this.value;
        }
    }
}




