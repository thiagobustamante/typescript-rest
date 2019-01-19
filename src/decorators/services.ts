'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import { PreprocessorFunction, ServiceClass, ServiceMethod } from '../server/metadata';
import { ServerContainer } from '../server/server-container';
import { ServicePreProcessor } from '../server/server-types';

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
        .decorateTypeOrMethod();
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
        .decorateTypeOrMethod();
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
export function Preprocessor(preprocessor: ServicePreProcessor) {
    return function (...args: Array<any>) {
        args = _.without(args, undefined);
        if (preprocessor) {
            if (args.length === 1) {
                return PreprocessorTypeDecorator.apply(this, [args[0], preprocessor]);
            } else if (args.length === 3 && typeof args[2] === 'object') {
                return PreprocessorMethodDecorator.apply(this, [args[0], args[1], args[2], preprocessor]);
            }
        }

        throw new Error('Invalid @Preprocessor Decorator declaration.');
    };
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
    return function (...args: Array<any>) {
        languages = _.compact(languages);
        if (languages.length) {
            args = _.without(args, undefined);
            if (args.length === 1) {
                return AcceptLanguageTypeDecorator.apply(this, [args[0], languages]);
            } else if (args.length === 3 && typeof args[2] === 'object') {
                return AcceptLanguageMethodDecorator.apply(this, [args[0], args[1], args[2], languages]);
            }
        }

        throw new Error('Invalid @AcceptLanguage Decorator declaration.');
    };
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
    return function (...args: Array<any>) {
        accepts = _.compact(accepts);
        if (accepts.length) {
            args = _.without(args, undefined);
            if (args.length === 1) {
                return AcceptTypeDecorator.apply(this, [args[0], accepts]);
            } else if (args.length === 3 && typeof args[2] === 'object') {
                return AcceptMethodDecorator.apply(this, [args[0], args[1], args[2], accepts]);
            }
        }
        throw new Error('Invalid @Accept Decorator declaration.');
    };
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on classes
 */
function AcceptLanguageTypeDecorator(target: Function, languages: Array<string>) {
    const classData: ServiceClass = ServerContainer.get().registerServiceClass(target);
    classData.languages = _.union(classData.languages, languages);
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on methods
 */
function AcceptLanguageMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, languages: Array<string>) {
    const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.languages = _.union(serviceMethod.languages, languages);
    }
}

/**
 * Decorator processor for [[Accept]] decorator on classes
 */
function AcceptTypeDecorator(target: Function, accepts: Array<string>) {
    const classData: ServiceClass = ServerContainer.get().registerServiceClass(target);
    classData.accepts = _.union(classData.accepts, accepts);
}

/**
 * Decorator processor for [[Accept]] decorator on methods
 */
function AcceptMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, accepts: Array<string>) {
    const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.accepts = _.union(serviceMethod.accepts, accepts);
    }
}

/**
 * Decorator processor for [[Preprocessor]] decorator on classes
 */
function PreprocessorTypeDecorator(target: Function, preprocessor: PreprocessorFunction) {
    const classData: ServiceClass = ServerContainer.get().registerServiceClass(target);
    if (classData) {
        if (!classData.preProcessors) {
            classData.preProcessors = [];
        }
        classData.preProcessors.unshift(preprocessor);
    }
}

/**
 * Decorator processor for [[Preprocessor]] decorator on methods
 */
function PreprocessorMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, preprocessor: PreprocessorFunction) {
    const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        if (!serviceMethod.preProcessors) {
            serviceMethod.preProcessors = [];
        }
        serviceMethod.preProcessors.unshift(preprocessor);
    }
}

/**
 * A decorator to inform options to pe passed to bodyParser.
 * You can inform any property accepted by
 * [[bodyParser]](https://www.npmjs.com/package/body-parser)
 */
export function BodyOptions(options: any) {
    return new ServiceDecorator('BodyOptions').withProperty('bodyParserOptions').withValue(options)
        .decorateTypeOrMethod();
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
        const classData: ServiceClass = ServerContainer.get().registerServiceClass(target);
        if (classData) {
            classData[this.property] = this.value;
        }
    }

    private decorateMethod(target: Function, propertyKey: string) {
        const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            serviceMethod[this.property] = this.value;
        }
    }
}




