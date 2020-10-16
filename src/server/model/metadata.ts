'use strict';

import { HttpMethod, ParserType, ServiceProcessor } from './server-types';

export interface ServiceProperty {
    type: ParamType;
    name: string;
    propertyType: any;
}

/**
 * Metadata for REST service classes
 */
export class ServiceClass {
    [key: string]: any;

    public targetClass: any;
    public path: string;
    public authenticator: Record<string, Array<string>>;
    public preProcessors: Array<ServiceProcessor>;
    public postProcessors: Array<ServiceProcessor>;
    public methods: Map<string, ServiceMethod>;
    public bodyParserOptions: any;
    public bodyParserType: ParserType;
    public languages: Array<string>;
    public accepts: Array<string>;
    public properties: Map<string, ServiceProperty>;
    public isAbstract: boolean = false;
    public ignoreNextMiddlewares: boolean = false;
    constructor(targetClass: any) {
        this.targetClass = targetClass;
        this.methods = new Map<string, ServiceMethod>();
        this.properties = new Map<string, ServiceProperty>();
    }

    public addProperty(key: string, property: ServiceProperty) {
        this.properties.set(key, property);
    }

    public hasProperties(): boolean {
        return (this.properties && this.properties.size > 0);
    }
}

/**
 * Metadata for REST service methods
 */
export class ServiceMethod {
    [key: string]: any;

    public name: string;
    public path: string;
    public authenticator: Record<string, Array<string>>;
    public resolvedPath: string;
    public httpMethod: HttpMethod;
    public parameters: Array<MethodParam> = new Array<MethodParam>();
    public mustParseCookies: boolean = false;
    public files: Array<FileParam> = new Array<FileParam>();
    public mustParseBody: boolean = false;
    public bodyParserOptions: any;
    public bodyParserType: ParserType;
    public mustParseForms: boolean = false;
    public acceptMultiTypedParam: boolean = false;
    public languages: Array<string>;
    public accepts: Array<string>;
    public resolvedLanguages: Array<string>;
    public resolvedAccepts: Array<string>;
    public preProcessors: Array<ServiceProcessor>;
    public postProcessors: Array<ServiceProcessor>;
    public ignoreNextMiddlewares: boolean = false;
}

/**
 * Metadata for File parameters on REST methods
 */
export class FileParam {

    public name: string;
    public singleFile: boolean;
    constructor(name: string, singleFile: boolean) {
        this.name = name;
        this.singleFile = singleFile;
    }
}

/**
 * Metadata for REST service method parameters
 */
export class MethodParam {

    public name: string;
    public type: Function;
    public paramType: ParamType;
    constructor(name: string, type: Function, paramType: ParamType) {
        this.name = name;
        this.type = type;
        this.paramType = paramType;
    }
}

/**
 * Enumeration of accepted parameter types
 */
export enum ParamType {
    path = 'path',
    query = 'query',
    header = 'header',
    cookie = 'cookie',
    form = 'form',
    body = 'body',
    param = 'param',
    file = 'file',
    files = 'files',
    context = 'context',
    context_request = 'context_request',
    context_response = 'context_response',
    context_next = 'context_next',
    context_accept = 'context_accept',
    context_accept_language = 'context_accept_language'
}
