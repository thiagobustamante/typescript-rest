import * as express from "express";
import { HttpMethod } from "./server-types";
export declare class Server {
    static buildServices(router: express.Router): void;
    static getPaths(): Array<string>;
    static getHttpMethods(path: string): Array<HttpMethod>;
    static setCookiesSecret(secret: string): void;
    static setCookiesDecoder(decoder: (val: string) => string): void;
    static setFileDest(dest: string): void;
    static setFileFilter(filter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => void): void;
    static setFileLimits(limit: number): void;
}
