'use strict';

import { InternalServer } from './server-container';
import { HttpMethod } from './server-types';
import * as metadata from './metadata';
import 'reflect-metadata';
import * as _ from 'lodash';

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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        if (args.length === 1) {
            return PathTypeDecorator.apply(this, [args[0], path]);
        } else if (args.length === 3 && typeof args[2] === 'object') {
            return PathMethodDecorator.apply(this, [args[0], args[1], args[2], path]);
        }

        throw new Error('Invalid @Path Decorator declaration.');
    };
}

export function Security(roles: string[]) {
    return function(...args: any[]) {
        args = _.without(args, undefined);
        if (args.length === 3 && typeof args[2] === 'object') {
            return SecurityDecorator.apply(this, [args[0], args[1], args[2], roles]);
        }
        throw new Error('Invalid @Security Decorator declaration.');
    };
}

export function Preprocessor(preprocessor: Function) {
    return function(...args: any[]) {
        args = _.without(args, undefined);
        if (args.length === 1) {
            return PreprocessorTypeDecorator.apply(this, [args[0], preprocessor]);
        } else if (args.length === 3 && typeof args[2] === 'object') {
            return PreprocessorMethodDecorator.apply(this, [args[0], args[1], args[2], preprocessor]);
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
export function AcceptLanguage(...languages: string[]) {
    return function(...args: any[]) {
        args = _.without(args, undefined);
        if (args.length === 1) {
            return AcceptLanguageTypeDecorator.apply(this, [args[0], languages]);
        } else if (args.length === 3 && typeof args[2] === 'object') {
            return AcceptLanguageMethodDecorator.apply(this, [args[0], args[1], args[2], languages]);
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
export function Accept(...accepts: string[]) {
    return function(...args: any[]) {
        args = _.without(args, undefined);
        if (args.length === 1) {
            return AcceptTypeDecorator.apply(this, [args[0], accepts]);
        } else if (args.length === 3 && typeof args[2] === 'object') {
            return AcceptMethodDecorator.apply(this, [args[0], args[1], args[2], accepts]);
        }

        throw new Error('Invalid @Accept Decorator declaration.');
    };
}

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
	 context: ServiceContext;
 *       // ...
 * }
 * ```
 *
 * The field context on the above class will point to the current
 * [[ServiceContext]] instance.
 */
export function Context(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @Context Decorator declaration.');
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
	 request: express.Request;
 *       // ...
 * }
 * ```
 *
 * The field request on the above class will point to the current
 * request.
 */
export function ContextRequest(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context_request, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @ContextRequest Decorator declaration.');
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
	 response: express.Response;
 *       // ...
 * }
 * ```
 *
 * The field response on the above class will point to the current
 * response object.
 */
export function ContextResponse(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context_response, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @ContextResponse Decorator declaration.');
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
export function ContextNext(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context_next, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @ContextNext Decorator declaration.');
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
export function ContextLanguage(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context_accept_language, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @ContextLanguage Decorator declaration.');
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
export function ContextAccept(...args: any[]) {
    args = _.without(args, undefined);
    const newArgs = args.concat([metadata.ParamType.context_accept, null]);
    if (args.length < 3 || typeof args[2] === 'undefined') {
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length === 3 && typeof args[2] === 'number') {
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error('Invalid @ContextAccept Decorator declaration.');
}

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
    processHttpVerb(target, propertyKey, HttpMethod.GET);
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
    processHttpVerb(target, propertyKey, HttpMethod.POST);
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
    processHttpVerb(target, propertyKey, HttpMethod.PUT);
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
    processHttpVerb(target, propertyKey, HttpMethod.DELETE);
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
    processHttpVerb(target, propertyKey, HttpMethod.HEAD);
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
    processHttpVerb(target, propertyKey, HttpMethod.OPTIONS);
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
    processHttpVerb(target, propertyKey, HttpMethod.PATCH);
}

/**
 * A decorator to inform options to pe passed to bodyParser.
 * You can inform any property accepted by
 * [[bodyParser]](https://www.npmjs.com/package/body-parser)
 */
export function BodyOptions(options: any) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
        if (serviceMethod) { // does not intercept constructor
            serviceMethod.bodyParserOptions = options;
        }
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.path, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @PathParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.file, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @FileParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.files, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @FilesParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.query, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @QueryParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.header, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @HeaderParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.cookie, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @CookieParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.form, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @FormParam Decorator declaration.');
    };
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
    return function(...args: any[]) {
        args = _.without(args, undefined);
        const newArgs = args.concat([metadata.ParamType.param, name]);
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return processDecoratedProperty.apply(this, newArgs);
        } else if (args.length === 3 && typeof args[2] === 'number') {
            return processDecoratedParameter.apply(this, newArgs);
        }

        throw new Error('Invalid @Param Decorator declaration.');
    };
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
export function Abstract(target: Function) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
    classData.isAbstract = true;
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on classes
 */
function AcceptLanguageTypeDecorator(target: Function, languages: string[]) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
    classData.languages = _.union(classData.languages, languages);
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on methods
 */
function AcceptLanguageMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, languages: string[]) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.languages = languages;
    }
}

/**
 * Decorator processor for [[Accept]] decorator on classes
 */
function AcceptTypeDecorator(target: Function, accepts: string[]) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
    classData.accepts = _.union(classData.accepts, accepts);
}

/**
 * Decorator processor for [[Accept]] decorator on methods
 */
function AcceptMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, accepts: string[]) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.accepts = accepts;
    }
}

/**
 * Decorator processor for [[Path]] decorator on classes
 */
function PathTypeDecorator(target: Function, path: string) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
    if (classData) {
        classData.path = path;
    }
}

/**
 * Decorator processor for [[Path]] decorator on methods
 */
function PathMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, path: string) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.path = path;
    }
}

/**
 * Decorator processor for [[Security]] decorator on methods
 */
function SecurityDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, roles: string[]) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.security = roles;
    }
}

/**
 * Decorator processor for [[Preprocessor]] decorator on classes
 */
function PreprocessorTypeDecorator(target: Function, preprocessor: metadata.PreprocessorFunction) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
    if (classData) {
        if (!classData.processors) {
            classData.processors = [];
        }
        classData.processors.unshift(preprocessor);
    }
}

/**
 * Decorator processor for [[Preprocessor]] decorator on methods
 */
function PreprocessorMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, preprocessor: metadata.PreprocessorFunction) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        if (!serviceMethod.processors) {
            serviceMethod.processors = [];
        }
        serviceMethod.processors.unshift(preprocessor);
    }
}

/**
 * Decorator processor for parameter annotations on methods
 */
function processDecoratedParameter(target: Object, propertyKey: string, parameterIndex: number,
    paramType: metadata.ParamType, name: string) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey);

        while (paramTypes && serviceMethod.parameters.length < paramTypes.length) {
            serviceMethod.parameters.push(new metadata.MethodParam(null,
                paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
        }
        serviceMethod.parameters[parameterIndex] = new metadata.MethodParam(name, paramTypes[parameterIndex], paramType);
    }
}

/**
 * Decorator processor for annotations on properties
 */
function processDecoratedProperty(target: Function, key: string, paramType: metadata.ParamType, paramName: string) {
    const classData: metadata.ServiceClass = InternalServer.registerServiceClass(target.constructor);
    const propertyType = Reflect.getMetadata('design:type', target, key);
    classData.addProperty(key, paramType, paramName, propertyType);
}

/**
 * Decorator processor for HTTP verb annotations on methods
 */
function processHttpVerb(target: any, propertyKey: string,
    httpMethod: HttpMethod) {
    const serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        if (serviceMethod.httpMethod && serviceMethod.httpMethod !== httpMethod) {
            throw new Error('Method is already annotated with @' +
                HttpMethod[serviceMethod.httpMethod] +
                '. You can only map a method to one HTTP verb.');
        }
        serviceMethod.httpMethod = httpMethod;
        processServiceMethod(target, propertyKey, serviceMethod);
    }
}

/**
 * Extract metadata for rest methods
 */
function processServiceMethod(target: any, propertyKey: string, serviceMethod: metadata.ServiceMethod) {
    serviceMethod.name = propertyKey;
    const paramTypes = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey);
    while (paramTypes && paramTypes.length > serviceMethod.parameters.length) {
        serviceMethod.parameters.push(new metadata.MethodParam(null,
            paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
    }

    serviceMethod.parameters.forEach(param => {
        if (param.paramType === metadata.ParamType.cookie) {
            serviceMethod.mustParseCookies = true;
        } else if (param.paramType === metadata.ParamType.file) {
            serviceMethod.files.push(new metadata.FileParam(param.name, true));
        } else if (param.paramType === metadata.ParamType.files) {
            serviceMethod.files.push(new metadata.FileParam(param.name, false));
        } else if (param.paramType === metadata.ParamType.param) {
            serviceMethod.acceptMultiTypedParam = true;
        } else if (param.paramType === metadata.ParamType.form) {
            if (serviceMethod.mustParseBody) {
                throw Error('Can not use form parameters with a body parameter on the same method.');
            }
            serviceMethod.mustParseForms = true;
        } else if (param.paramType === metadata.ParamType.body) {
            if (serviceMethod.mustParseForms) {
                throw Error('Can not use form parameters with a body parameter on the same method.');
            }
            if (serviceMethod.mustParseBody) {
                throw Error('Can not use more than one body parameter on the same method.');
            }
            serviceMethod.mustParseBody = true;
        }
    });
}
