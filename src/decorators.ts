'use strict';

import * as _ from 'lodash';
import 'reflect-metadata';
import { ParameterDecorator } from './decorators/parameter-decorator';
import { ServiceDecorator } from './decorators/service-decorator';
import * as metadata from './metadata';
import { HttpMethod, ServicePreProcessor } from './server-types';
import { ServerContainer } from './server/server-container';

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
    return new ParameterDecorator('Context').withType(metadata.ParamType.context)
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
    return new ParameterDecorator('ContextRequest').withType(metadata.ParamType.context_request)
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
    return new ParameterDecorator('ContextResponse').withType(metadata.ParamType.context_response)
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
    return new ParameterDecorator('ContextNext').withType(metadata.ParamType.context_next)
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
        .withType(metadata.ParamType.context_accept_language)
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
    return new ParameterDecorator('ContextAccept').withType(metadata.ParamType.context_accept)
        .decorateParameterOrProperty(args);
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
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
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
    return new ParameterDecorator('PathParam').withType(metadata.ParamType.path).withName(name)
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
    return new ParameterDecorator('FileParam').withType(metadata.ParamType.file).withName(name)
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
    return new ParameterDecorator('FilesParam').withType(metadata.ParamType.files).withName(name)
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
    return new ParameterDecorator('QueryParam').withType(metadata.ParamType.query).withName(name)
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
    return new ParameterDecorator('HeaderParam').withType(metadata.ParamType.header).withName(name)
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
    return new ParameterDecorator('CookieParam').withType(metadata.ParamType.cookie).withName(name)
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
    return new ParameterDecorator('FormParam').withType(metadata.ParamType.form).withName(name)
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
    return new ParameterDecorator('Param').withType(metadata.ParamType.param).withName(name)
        .decorateNamedParameterOrProperty();
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
        const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(args[0]);
        classData.isAbstract = true;
    }
    else {
        throw new Error('Invalid @Abstract Decorator declaration.');
    }
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on classes
 */
function AcceptLanguageTypeDecorator(target: Function, languages: Array<string>) {
    const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(target);
    classData.languages = _.union(classData.languages, languages);
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on methods
 */
function AcceptLanguageMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, languages: Array<string>) {
    const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.languages = _.union(serviceMethod.languages, languages);
    }
}

/**
 * Decorator processor for [[Accept]] decorator on classes
 */
function AcceptTypeDecorator(target: Function, accepts: Array<string>) {
    const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(target);
    classData.accepts = _.union(classData.accepts, accepts);
}

/**
 * Decorator processor for [[Accept]] decorator on methods
 */
function AcceptMethodDecorator(target: any, propertyKey: string,
    descriptor: PropertyDescriptor, accepts: Array<string>) {
    const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        serviceMethod.accepts = _.union(serviceMethod.accepts, accepts);
    }
}

/**
 * Decorator processor for [[Preprocessor]] decorator on classes
 */
function PreprocessorTypeDecorator(target: Function, preprocessor: metadata.PreprocessorFunction) {
    const classData: metadata.ServiceClass = ServerContainer.get().registerServiceClass(target);
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
    descriptor: PropertyDescriptor, preprocessor: metadata.PreprocessorFunction) {
    const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        if (!serviceMethod.preProcessors) {
            serviceMethod.preProcessors = [];
        }
        serviceMethod.preProcessors.unshift(preprocessor);
    }
}

/**
 * Decorator processor for HTTP verb annotations on methods
 */
function processHttpVerb(target: any, propertyKey: string,
    httpMethod: HttpMethod) {
    const serviceMethod: metadata.ServiceMethod = ServerContainer.get().registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) { // does not intercept constructor
        if (!serviceMethod.httpMethod) {
            serviceMethod.httpMethod = httpMethod;
            processServiceMethod(target, propertyKey, serviceMethod);
        } else if (serviceMethod.httpMethod !== httpMethod) {
            throw new Error('Method is already annotated with @' +
                HttpMethod[serviceMethod.httpMethod] +
                '. You can only map a method to one HTTP verb.');
        }
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
