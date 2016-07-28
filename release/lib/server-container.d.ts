/// <reference path="../../typings/index.d.ts" />
import * as express from "express";
import * as multer from "multer";
import * as metadata from "./metadata";
import { HttpMethod } from "./server-types";
export declare class InternalServer {
    static serverClasses: Map<string, metadata.ServiceClass>;
    static paths: Map<string, Set<HttpMethod>>;
    static pathsResolved: boolean;
    static cookiesSecret: string;
    static cookiesDecoder: (val: string) => string;
    static fileDest: string;
    static fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void;
    static fileLimits: number;
    router: express.Router;
    upload: multer.Instance;
    constructor(router: express.Router);
    static registerServiceClass(target: Function): metadata.ServiceClass;
    static registerServiceMethod(target: Function, methodName: string): metadata.ServiceMethod;
    buildServices(): void;
    buildService(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod): void;
    private getUploader();
    private buildServiceMiddleware(serviceMethod);
    private processResponseHeaders(serviceMethod, context);
    private acceptable(serviceMethod, context);
    private createService(serviceClass, context);
    private callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
    private sendValue(value, res);
    private buildArgumentsList(serviceMethod, context);
    private convertType(paramValue, paramType);
    static resolveAllPaths(): void;
    static getPaths(): Set<string>;
    static getHttpMethods(path: string): Set<HttpMethod>;
    private static resolveLanguages(serviceClass, serviceMethod);
    private static resolveAccepts(serviceClass, serviceMethod);
    private static resolveProperties(serviceClass, serviceMethod);
    private static resolvePath(serviceClass, serviceMethod);
}
