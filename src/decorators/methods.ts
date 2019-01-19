'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import * as metadata from '../metadata';
import { HttpMethod } from '../server-types';
import { ServerContainer } from '../server/server-container';


/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP GET requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * GET http://mydomain/people
 * ```
 */
export function GET(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.GET).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP POST requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ POST
 *   addPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * POST http://mydomain/people
 * ```
 */
export function POST(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.POST).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP PUT requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ PUT
 *   @ Path(':id')
 *   savePerson(person: Person) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123
 * ```
 */
export function PUT(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.PUT).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP DELETE requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ DELETE
 *   @ Path(':id')
 *   removePerson(@ PathParam('id')id: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123
 * ```
 */
export function DELETE(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.DELETE).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP HEAD requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ HEAD
 *   headPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * HEAD http://mydomain/people/123
 * ```
 */
export function HEAD(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.HEAD).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP OPTIONS requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ OPTIONS
 *   optionsPerson() {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * OPTIONS http://mydomain/people/123
 * ```
 */
export function OPTIONS(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.OPTIONS).decorateMethod(target, propertyKey);
}

/**
 * A decorator to tell the [[Server]] that a method
 * should be called to process HTTP PATCH requests.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ PATCH
 *   @ Path(':id')
 *   savePerson(person: Person) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * PATCH http://mydomain/people/123
 * ```
 */
export function PATCH(target: any, propertyKey: string,
    descriptor: PropertyDescriptor) {
    new MethodDecorator(HttpMethod.PATCH).decorateMethod(target, propertyKey);
}

class MethodDecorator {
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
