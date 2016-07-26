/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import "reflect-metadata";
export declare function Path(path: string): (...args: any[]) => any;
export declare function AcceptLanguage(...languages: string[]): (...args: any[]) => any;
export declare function Accept(...accepts: string[]): (...args: any[]) => any;
export declare function Context(...args: any[]): any;
export declare function ContextRequest(...args: any[]): any;
export declare function ContextResponse(...args: any[]): any;
export declare function ContextNext(...args: any[]): any;
export declare function ContextLanguage(...args: any[]): any;
export declare function ContextAccepts(...args: any[]): any;
export declare function GET(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function POST(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function PUT(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function DELETE(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function HEAD(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function OPTIONS(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function PATCH(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function PathParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function FileParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function FilesParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function QueryParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function HeaderParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function CookieParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function FormParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare class ServiceContext {
    language: string;
    preferredMedia: string;
    request: express.Request;
    response: express.Response;
    next: express.NextFunction;
}
export declare enum HttpMethod {
    GET = 0,
    POST = 1,
    PUT = 2,
    DELETE = 3,
    HEAD = 4,
    OPTIONS = 5,
    PATCH = 6,
}
export declare abstract class Server {
    static buildServices(router: express.Router): void;
    static getPaths(): Set<string>;
    static getHttpMethods(path: string): Set<HttpMethod>;
    static setCookiesSecret(secret: string): void;
    static setCookiesDecoder(decoder: (val: string) => string): void;
    static setFileDest(dest: string): void;
    static setFileFilter(filter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void): void;
    static setFileLimits(limit: number): void;
}
