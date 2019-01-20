'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import { ServiceClass, ServiceMethod } from '../server/model/metadata';
import { ServicePreProcessor } from '../server/model/server-types';
import { ServerContainer } from '../server/server-container';

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should be bound to a given path.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ PUT
 *   @ Path(':id')
 *   savePerson(person:Person) {
 *      // ...
 *   }
 *
 *   @ GET
 *   @ Path(':id')
 *   getPerson():Person {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create services that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123 or
 * GET http://mydomain/people/123
 * ```
 */
export function Path(path: string) {
    return new ServiceDecorator('Path').withProperty('path').withValue(path)
        .createDecorator();
}

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should include a determined role
 * or all authorized users (token) using passport
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * @ Security()
 * class PeopleService {
 *   @ PUT
 *   @ Path(':id', true)
 *   @ Security(['ROLE_ADMIN'])
 *   savePerson(person:Person) {
 *      // ...
 *   }
 *
 *   @ GET
 *   @ Path(':id', true)
 *   getPerson():Person {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create services that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123 (Only for ADMIN roles) or
 * GET http://mydomain/people/123 (For all authorized users)
 * ```
 */
export function Security(roles?: string | Array<string>) {
    roles = _.castArray(roles || '*');
    return new ServiceDecorator('Security').withProperty('roles').withValue(roles)
        .createDecorator();
}

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should include a pre-processor in its request pipelines.
 *
 * For example:
 * ```
 * function validator(req: express.Request): express.Request {
 *   if (!req.body.userId) {
 *      throw new Errors.BadRequestError("userId not present");
 *   } 
 * }
 * ```
 * And:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ PUT
 *   @ Path(':id')
 *   @ Preprocessor(validator)
 *   savePerson(person:Person) {
 *      // ...
 *   }
 * }
 * ```
 */
export function PreProcessor(preprocessor: ServicePreProcessor) {
    return new ProcessorServiceDecorator('PreProcessor')
        .withProperty('preProcessors').withValue(preprocessor)
        .requiresValue().createDecorator();
}

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should only accept requests from clients that accepts one of
 * the supported languages.
 *
 * For example:
 *
 * ```
 * @ Path('accept')
 * @ AcceptLanguage('en', 'pt-BR')
 * class TestAcceptService {
 *      // ...
 * }
 * ```
 *
 * Will reject requests that only accepts languages that are not
 * English or Brazilian portuguese
 *
 * If the language requested is not supported, a status code 406 returned
 */
export function AcceptLanguage(...languages: Array<string>) {
    languages = _.compact(languages);
    return new AcceptServiceDecorator('AcceptLanguage').withProperty('languages').withValue(languages)
        .createDecorator();
}

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should only accept requests from clients that accepts one of
 * the supported mime types.
 *
 * For example:
 *
 * ```
 * @ Path('accept')
 * @ Accept('application/json')
 * class TestAcceptService {
 *      // ...
 * }
 * ```
 *
 * Will reject requests that only accepts mime types that are not
 * 'application/json'
 *
 * If the mime type requested is not supported, a status code 406 returned
 */
export function Accept(...accepts: Array<string>) {
    accepts = _.compact(accepts);
    return new AcceptServiceDecorator('Accept').withProperty('accepts').withValue(accepts)
        .createDecorator();
}

/**
 * A decorator to inform options to pe passed to bodyParser.
 * You can inform any property accepted by
 * [[bodyParser]](https://www.npmjs.com/package/body-parser)
 */
export function BodyOptions(options: any) {
    return new ServiceDecorator('BodyOptions').withProperty('bodyParserOptions').withValue(options)
        .createDecorator();
}

/**
 * A decorator to inform that server should ignore other middlewares.
 * It makes server does not call next function after service invocation.
 */
export function IgnoreNextMiddlewares(...args: Array<any>) {
    return new ServiceDecorator('IgnoreNextMiddlewares')
        .withProperty('ignoreNextMiddlewares').withValue(true)
        .decorateTypeOrMethod(args);
}

/**
 * Mark the annotated service class as an abstract service. Abstract services has none of its
 * methods exposed as rest enpoints, even if the class is in the services list to be exposed.
 *
 * For example:
 *
 * ```
 * @ Abstract
 * abstract class PeopleService {
 *   @ GET
 *   getPeople(@ Param('name') name: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * No endpoint will be registered for PeopleService. It is useful if you only plain that subclasses of
 * PeopleService exposes the getPeople method.
 */
export function Abstract(...args: Array<any>) {
    args = _.without(args, undefined);
    if (args.length === 1) {
        const classData: ServiceClass = ServerContainer.get().registerServiceClass(args[0]);
        classData.isAbstract = true;
    }
    else {
        throw new Error('Invalid @Abstract Decorator declaration.');
    }
}

class ServiceDecorator {
    protected decorator: string;
    protected property: string;
    protected value: any;
    protected valueRequired: boolean = false;

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

    public requiresValue() {
        this.valueRequired = true;
        return this;
    }

    public createDecorator() {
        return (...args: Array<any>) => {
            this.checkRequiredValue();
            this.decorateTypeOrMethod(args);
        };
    }

    public decorateTypeOrMethod(args: Array<any>) {
        args = _.without(args, undefined);
        if (args.length === 1) {
            this.decorateType(args[0]);
        } else if (args.length === 3 && typeof args[2] === 'object') {
            this.decorateMethod(args[0], args[1]);
        } else {
            throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
        }
    }

    protected checkRequiredValue() {
        if (this.valueRequired && !this.value) {
            throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
        }
    }

    protected decorateType(target: Function) {
        const classData: ServiceClass = ServerContainer.get().registerServiceClass(target);
        if (classData) {
            this.updateClassMetadata(classData);
        }
    }

    protected decorateMethod(target: Function, propertyKey: string) {
        const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            this.updateMethodMetadada(serviceMethod);
        }
    }

    protected updateClassMetadata(classData: ServiceClass) {
        classData[this.property] = this.value;
    }

    protected updateMethodMetadada(serviceMethod: ServiceMethod) {
        serviceMethod[this.property] = this.value;
    }
}

class ProcessorServiceDecorator extends ServiceDecorator {
    protected updateClassMetadata(classData: ServiceClass) {
        if (!classData[this.property]) {
            classData[this.property] = [];
        }
        classData[this.property].unshift(this.value);
    }

    protected updateMethodMetadada(serviceMethod: ServiceMethod) {
        if (!serviceMethod[this.property]) {
            serviceMethod[this.property] = [];
        }
        serviceMethod[this.property].unshift(this.value);
    }
}

class AcceptServiceDecorator extends ServiceDecorator {
    constructor(decorator: string) {
        super(decorator);
        this.requiresValue();
    }

    protected updateClassMetadata(classData: ServiceClass) {
        classData[this.property] = _.union(classData[this.property], this.value);
    }

    protected updateMethodMetadada(serviceMethod: ServiceMethod) {
        serviceMethod[this.property] = _.union(serviceMethod[this.property], this.value);
    }

    protected checkRequiredValue() {
        if (!this.value || !this.value.length) {
            throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
        }
    }
}