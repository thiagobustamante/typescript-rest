'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import { ServiceClass, ServiceMethod } from '../server/model/metadata';
import { ParserType, ServiceProcessor } from '../server/model/server-types';
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
    return new ServiceDecorator('Path').withProperty('path', path)
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
export function Security(roles?: string | Array<string>, name?: string) {
    roles = _.castArray(roles || '*');
    return new SecurityServiceDecorator('Security')
        .withObjectProperty('authenticator', name || 'default', roles)
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
 *   @ PreProcessor(validator)
 *   savePerson(person:Person) {
 *      // ...
 *   }
 * }
 * ```
 */
export function PreProcessor(preprocessor: ServiceProcessor) {
    return new ProcessorServiceDecorator('PreProcessor')
        .withArrayProperty('preProcessors', preprocessor, true)
        .createDecorator();
}

/**
 * A decorator to tell the [[Server]] that a class or a method
 * should include a post-processor in its request pipelines.
 *
 * For example:
 * ```
 * function processor(req: express.Request): express.Request {
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
 *   @ PostProcessor(validator)
 *   savePerson(person:Person) {
 *      // ...
 *   }
 * }
 * ```
 */
export function PostProcessor(postprocessor: ServiceProcessor) {
    return new ProcessorServiceDecorator('PostProcessor')
        .withArrayProperty('postProcessors', postprocessor, true)
        .createDecorator();
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
    return new AcceptServiceDecorator('AcceptLanguage').withArrayProperty('languages', languages, true)
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
    return new AcceptServiceDecorator('Accept').withArrayProperty('accepts', accepts, true)
        .createDecorator();
}

/**
 * A decorator to inform options to pe passed to bodyParser.
 * You can inform any property accepted by
 * [[bodyParser]](https://www.npmjs.com/package/body-parser)
 */
export function BodyOptions(options: any) {
    return new ServiceDecorator('BodyOptions').withProperty('bodyParserOptions', options)
        .createDecorator();
}

/**
 * A decorator to inform the type of parser to be used to parse the body.
 * The default type is json.
 */
export function BodyType(type: ParserType) {
    return new ServiceDecorator('BodyType').withProperty('bodyParserType', type)
        .createDecorator();
}

/**
 * A decorator to inform that server should ignore other middlewares.
 * It makes server does not call next function after service invocation.
 */
export function IgnoreNextMiddlewares(...args: Array<any>) {
    return new ServiceDecorator('IgnoreNextMiddlewares').withProperty('ignoreNextMiddlewares', true)
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

interface DecoratorProperty {
    property: string;
    value: any;
    required: boolean;
    process: (target: any) => void;
    checkRequired: () => boolean;
}

class ServiceDecorator {
    protected decorator: string;
    protected properties: Array<DecoratorProperty> = [];

    constructor(decorator: string) {
        this.decorator = decorator;
    }

    public withProperty(property: string, value: any, required: boolean = false) {
        this.properties.push({
            checkRequired: () => required && !value,
            process: (target: any) => {
                target[property] = value;
            },
            property: property,
            required: required,
            value: value
        });
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
        this.properties.forEach(property => {
            if (property.checkRequired()) {
                throw new Error(`Invalid @${this.decorator} Decorator declaration.`);
            }
        });
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
        this.properties.forEach(property => {
            property.process(classData);
        });
    }

    protected updateMethodMetadada(serviceMethod: ServiceMethod) {
        this.properties.forEach(property => {
            property.process(serviceMethod);
        });
    }
}

class SecurityServiceDecorator extends ServiceDecorator {
    public withObjectProperty(property: string, subtext: string, value: any, required: boolean = false) {
        this.properties.push({
            checkRequired: () => required && !value,
            process: (target: any) => {
                if (!target[property]) {
                    target[property] = {};
                }
                target[property][subtext] = value;
            },
            property: property,
            required: required,
            value: value
        });
        return this;
    }
}

class ProcessorServiceDecorator extends ServiceDecorator {
    public withArrayProperty(property: string, value: any, required: boolean = false) {
        this.properties.push({
            checkRequired: () => required && !value,
            process: (target: any) => {
                if (!target[property]) {
                    target[property] = [];
                }
                target[property].unshift(value);
            },
            property: property,
            required: required,
            value: value
        });
        return this;
    }
}

class AcceptServiceDecorator extends ServiceDecorator {
    public withArrayProperty(property: string, value: any, required: boolean = false) {
        this.properties.push({
            checkRequired: () => required && (!value || !value.length),
            process: (target: any) => {
                target[property] = _.union(target[property], value);
            },
            property: property,
            required: required,
            value: value
        });
        return this;
    }
}