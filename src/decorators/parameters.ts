'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import { MethodParam, ParamType, ServiceClass, ServiceMethod } from '../server/model/metadata';
import { ServerContainer } from '../server/server-container';


/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * [[ServiceContext]] object associated to the current request.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ Context
 *   context: ServiceContext;
 *   // ...
 * }
 * ```
 *
 * The field context on the above class will point to the current
 * [[ServiceContext]] instance.
 */
export function Context(...args: Array<any>) {
    return new ParameterDecorator('Context').withType(ParamType.context)
        .decorateParameterOrProperty(args);
}

/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the current request.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ ContextRequest
 *   request: express.Request;
 *   // ...
 * }
 * ```
 *
 * The field request on the above class will point to the current
 * request.
 */
export function ContextRequest(...args: Array<any>) {
    return new ParameterDecorator('ContextRequest').withType(ParamType.context_request)
        .decorateParameterOrProperty(args);
}

/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the current response object.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ ContextResponse
 *   response: express.Response;
 *   // ...
 * }
 * ```
 *
 * The field response on the above class will point to the current
 * response object.
 */
export function ContextResponse(...args: Array<any>) {
    return new ParameterDecorator('ContextResponse').withType(ParamType.context_response)
        .decorateParameterOrProperty(args);
}

/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the next function.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ ContextNext
 *   next: express.NextFunction
 *       // ...
 * }
 * ```
 *
 * The next function can be used to delegate to the next registered
 * middleware the current request processing.
 */
export function ContextNext(...args: Array<any>) {
    return new ParameterDecorator('ContextNext').withType(ParamType.context_next)
        .decorateParameterOrProperty(args);
}

/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the current context language.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ ContextLanguage
 *   language: string
 *       // ...
 * }
 * ```
 */
export function ContextLanguage(...args: Array<any>) {
    return new ParameterDecorator('ContextLanguage')
        .withType(ParamType.context_accept_language)
        .decorateParameterOrProperty(args);
}

/**
 * A decorator to be used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the preferred media type for the current request.
 *
 * For example:
 *
 * ```
 * @ Path('context')
 * class TestService {
 *   @ ContextAccept
 *   media: string
 *       // ...
 * }
 * ```
 */
export function ContextAccept(...args: Array<any>) {
    return new ParameterDecorator('ContextAccept').withType(ParamType.context_accept)
        .decorateParameterOrProperty(args);
}


/**
 * Creates a mapping between a fragment of the requested path and
 * a method argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   @ Path(':id')
 *   getPerson(@ PathParam('id') id: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * GET http://mydomain/people/123
 * ```
 *
 * And pass 123 as the id argument on getPerson method's call.
 */
export function PathParam(name: string) {
    return new ParameterDecorator('PathParam').withType(ParamType.path).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a file on a multipart request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ POST
 *   @ Path('id')
 *   addAvatar(@ PathParam('id') id: string,
 *             @ FileParam('avatar') file: Express.Multer.File) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * file with name 'avatar' on the requested form to the file
 * argument on addAvatar method's call.
 */
export function FileParam(name: string) {
    return new ParameterDecorator('FileParam').withType(ParamType.file).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a list of files on a multipart request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ POST
 *   @ Path('id')
 *   addAvatar(@ PathParam('id') id: string,
 *             @ FilesParam('avatar[]') files: Array<Express.Multer.File>) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * files with name 'avatar' on the request form to the file
 * argument on addAvatar method's call.
 */
export function FilesParam(name: string) {
    return new ParameterDecorator('FilesParam').withType(ParamType.files).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a query parameter on request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople(@ QueryParam('name') name: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests like:
 *
 * ```
 * GET http://mydomain/people?name=joe
 * ```
 *
 * And pass 'joe' as the name argument on getPerson method's call.
 */
export function QueryParam(name: string) {
    return new ParameterDecorator('QueryParam').withType(ParamType.query).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a header on request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople(@ HeaderParam('header') header: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * header called 'header' to the header argument on getPerson method's call.
 */
export function HeaderParam(name: string) {
    return new ParameterDecorator('HeaderParam').withType(ParamType.header).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a cookie on request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople(@ CookieParam('cookie') cookie: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * cookie called 'cookie' to the cookie argument on getPerson method's call.
 */
export function CookieParam(name: string) {
    return new ParameterDecorator('CookieParam').withType(ParamType.cookie).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a form parameter on request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople(@ FormParam('name') name: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * request paramenter called 'name' to the name argument on getPerson
 * method's call.
 */
export function FormParam(name: string) {
    return new ParameterDecorator('FormParam').withType(ParamType.form).withName(name)
        .decorateNamedParameterOrProperty();
}

/**
 * Creates a mapping between a parameter on request and a method
 * argument.
 *
 * For example:
 *
 * ```
 * @ Path('people')
 * class PeopleService {
 *   @ GET
 *   getPeople(@ Param('name') name: string) {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create a service that listen for requests and bind the
 * request paramenter called 'name' to the name argument on getPerson
 * method's call. It will work to query parameters or form parameters
 * received in the current request.
 */
export function Param(name: string) {
    return new ParameterDecorator('Param').withType(ParamType.param).withName(name)
        .decorateNamedParameterOrProperty();
}

class ParameterDecorator {
    private decorator: string;
    private paramType: ParamType;
    private nameRequired: boolean = false;
    private name: string = null;

    constructor(decorator: string) {
        this.decorator = decorator;
    }

    public withType(paramType: ParamType) {
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
        const serviceMethod: ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey);

            while (paramTypes && serviceMethod.parameters.length < paramTypes.length) {
                serviceMethod.parameters.push(new MethodParam(null,
                    paramTypes[serviceMethod.parameters.length], ParamType.body));
            }
            serviceMethod.parameters[parameterIndex] =
                new MethodParam(this.name, paramTypes[parameterIndex], this.paramType);
        }
    }

    private decorateProperty(target: Function, key: string) {
        const classData: ServiceClass = ServerContainer.get().registerServiceClass(target.constructor);
        const propertyType = Reflect.getMetadata('design:type', target, key);
        classData.addProperty(key, {
            name: this.name,
            propertyType: propertyType,
            type: this.paramType
        });
    }
}




