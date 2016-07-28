/// <reference path="../../typings/index.d.ts" />
import { HttpMethod } from "./server-types";
export declare class ServiceClass {
    constructor(targetClass: Function);
    targetClass: Function;
    path: string;
    methods: Map<string, ServiceMethod>;
    languages: Array<string>;
    accepts: Array<string>;
    properties: Map<string, ParamType>;
    addProperty(key: string, paramType: ParamType): void;
    hasProperties(): boolean;
}
export declare class ServiceMethod {
    name: string;
    path: string;
    resolvedPath: string;
    httpMethod: HttpMethod;
    returnType: Function;
    parameters: Array<MethodParam>;
    mustParseCookies: boolean;
    files: Array<FileParam>;
    mustParseBody: boolean;
    mustParseForms: boolean;
    languages: Array<string>;
    accepts: Array<string>;
    resolvedLanguages: Array<string>;
    resolvedAccepts: Array<string>;
}
export declare class FileParam {
    constructor(name: string, singleFile: boolean);
    name: string;
    singleFile: boolean;
}
export declare class MethodParam {
    constructor(name: string, type: Function, paramType: ParamType);
    name: string;
    type: Function;
    paramType: ParamType;
}
export declare enum ParamType {
    path = 0,
    query = 1,
    header = 2,
    cookie = 3,
    form = 4,
    body = 5,
    file = 6,
    files = 7,
    context = 8,
    context_request = 9,
    context_response = 10,
    context_next = 11,
    context_accept = 12,
    context_accept_language = 13,
}
