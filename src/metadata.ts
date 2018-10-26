'use strict';

import { HttpMethod } from './server-types';

export type PreprocessorFunction = (req: Express.Request) => Express.Request;

export interface SeviceProperty {
    type: ParamType;
    name: string;
    propertyType: any;
}

/**
 * Metadata for REST service classes
 */
export class ServiceClass {
    constructor(targetClass: any) {
        this.targetClass = targetClass;
        this.methods = new Map<string, ServiceMethod>();
        this.properties = new Map<string, SeviceProperty>();
        this.languages = new Array<string>();
        this.accepts = new Array<string>();
    }

    targetClass: any;
    path: string;
    roles: string[];
    processors: Array<PreprocessorFunction>;
    methods: Map<string, ServiceMethod>;
    languages: Array<string>;
    accepts: Array<string>;
    properties: Map<string, SeviceProperty>;
    isAbstract: boolean = false;

    addProperty(key: string, paramType: ParamType, paramName: string, propertyType: any) {
        this.properties.set(key, { type: paramType, name: paramName, propertyType: propertyType });
    }

    hasProperties(): boolean {
        return (this.properties && this.properties.size > 0);
    }
}

/**
 * Metadata for REST service methods
 */
export class ServiceMethod {
    name: string;
    path: string;
    roles: string[];
    resolvedPath: string;
    httpMethod: HttpMethod;
    parameters: Array<MethodParam> = new Array<MethodParam>();
    mustParseCookies: boolean = false;
    files: Array<FileParam> = new Array<FileParam>();
    mustParseBody: boolean = false;
    bodyParserOptions: any;
    mustParseForms: boolean = false;
    acceptMultiTypedParam: boolean = false;
    languages: Array<string>;
    accepts: Array<string>;
    resolvedLanguages: Array<string>;
    resolvedAccepts: Array<string>;
    processors: Array<PreprocessorFunction>;
}

/**
 * Metadata for File parameters on REST methods
 */
export class FileParam {
    constructor(name: string, singleFile: boolean) {
        this.name = name;
        this.singleFile = singleFile;
    }

    name: string;
    singleFile: boolean;
}

/**
 * Metadata for REST service method parameters
 */
export class MethodParam {
    constructor(name: string, type: Function, paramType: ParamType) {
        this.name = name;
        this.type = type;
        this.paramType = paramType;
    }

    name: string;
    type: Function;
    paramType: ParamType;
}

/**
 * Enumeration of accepted parameter types
 */
export enum ParamType {
    path,
    query,
    header,
    cookie,
    form,
    body,
    param,
    file,
    files,
    context,
    context_request,
    context_response,
    context_next,
    context_accept,
    context_accept_language
}
