/// <reference path="../../typings/index.d.ts" />
import * as express from "express";
import { HttpMethod } from "./server-types";
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
