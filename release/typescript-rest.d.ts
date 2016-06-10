/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import "reflect-metadata";
export declare function Path(path: string): (...args: any[]) => any;
export declare function GET(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function POST(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function PUT(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function DELETE(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function HEAD(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function OPTIONS(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function PathParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function QueryParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function HeaderParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function CookieParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare function FormParam(name: string): (target: Object, propertyKey: string, parameterIndex: number) => void;
export declare enum HttpMethod {
    GET = 0,
    POST = 1,
    PUT = 2,
    DELETE = 3,
    HEAD = 4,
    OPTIONS = 5,
}
export declare abstract class Server {
    static buildServices(router: express.Router): void;
    static getPaths(): Set<string>;
    static getHttpMethods(path: string): Set<HttpMethod>;
    static setCookiesSecret(secret: string): void;
    static setCookiesDecoder(decoder: Function): void;
}
