'use strict';
/* tslint:disable */
import * as express from 'express';
import {Inject, AutoWired} from 'typescript-ioc';
import * as fs from 'fs';
import * as _ from 'lodash';

import {Path, Server, GET, POST, PUT, DELETE,
        PathParam, QueryParam, CookieParam, HeaderParam,
        FormParam, Param, Context, ServiceContext, ContextRequest,
        ContextResponse, ContextLanguage, ContextAccept,
        ContextNext, AcceptLanguage, Accept, FileParam,
        Errors, Return, BodyOptions, Abstract, Preprocessor} from '../../src/typescript-rest';

Server.useIoC();

export class Person {
    constructor(id: number, name: string, age: number, salary: number = age * 1000) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
    id: number;
    name: string;
    age: number;
    salary: number;
}

@AcceptLanguage('en', 'pt-BR')
@Accept('application/json')
@Abstract
export abstract class BaseApi {
    @Context
    context: ServiceContext;

    @GET
    @Path(':id')
    testCrudGet(@PathParam('id') id: string) {
        if (context) {
            return 'OK_'+id;
        }
        return 'false';
    }

    @GET
    @Path('overload/:id')
    testOverloadGet(@PathParam('id') id: string) {
        if (context) {
            return 'OK_'+id;
        }
        return 'false';
    }

    @PUT
    @Path('overload/:id')
    testOverloadPut(@PathParam('id') id: string) {
        if (context) {
            return 'OK_'+id;
        }
        return 'false';
    }
    
}

@Path('superclass')
export class SuperClassService extends BaseApi {
    @GET
    @Path('overload/:id')
    testOverloadGet(@PathParam('id') id: string) {
        if (context) {
            return 'superclass_OK_'+id;
        }
        return 'false';
    }

    @PUT
    @Path('overload/:id')
    testOverloadPut(@PathParam('id') id: string) {
        if (context) {
            return 'superclass_OK_'+id;
        }
        return 'false';
    }
}

@AutoWired
export class InjectableObject {

}

@AutoWired
@Path('ioctest')
export class MyIoCService {
    @Inject
    private injectedObject: InjectableObject
    
    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}

@Path('ioctest2')
@AutoWired
export class MyIoCService2 {
    @Inject
    private injectedObject: InjectableObject
    
    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}


@Path('ioctest3')
@AutoWired
export class MyIoCService3 {
    private injectedObject: InjectableObject

    constructor(@Inject injectedObject: InjectableObject) {
        this.injectedObject = injectedObject;
    }

    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}

@Path('ioctest4')
@AutoWired
export class MyIoCService4 extends MyIoCService2 {
}


@Path('mypath')
export class MyService {
    @GET
    test( ): string {
        return 'OK';
    }

    @GET
    @Path('secondpath')
    test2( ): string {
        return 'OK';
    }
}

@Path('mypath2')
export class MyService2 {
    @GET
    @Path('secondpath')
    test( ): string {
        return 'OK';
    }

    @DELETE
    @Path('secondpath')
    testDelete( ): string {
        return 'OK';
    }
}

@Path('/asubpath/person')
export class PersonService {
    @Path(':id')
    @GET
    getPerson( @PathParam('id') id: number): Promise<Person> {
        return new Promise<Person>(function(resolve, reject){
            resolve(new Person(id, 'Fulano de Tal número ' + id.toString(), 35));
        });
    }

    @PUT
    @Path('/:id')
    setPerson( person: Person): number {
        return person.salary;
    }

    @POST
    @BodyOptions({limit:'100kb'})
    addPerson(@ContextRequest req: express.Request, person: Person): Return.NewResource<{id:number}> {
        return new Return.NewResource<{id:number}>(req.url + '/' + person.id, {id: person.id});
    }

    @GET
    getAll( @QueryParam('start') start: number, 
            @QueryParam('size') size: number): Person[] {
        let result: Array<Person> = new Array<Person>();

        for (let i: number = start; i < (start + size); i++) {
            result.push(new Person(i, 'Fulano de Tal número ' + i.toString(), 35));
        }
        return result;
    }
}

export class TestParams {
    
    @Context
    context: ServiceContext;

    @HeaderParam('my-header')
    private myHeader: ServiceContext;

    @GET
    @Path('myheader')
    testMyHeader(): string {
        return 'header: ' + this.myHeader;
    }

    @GET
    @Path('headers')
    testHeaders( @HeaderParam('my-header') header: string,
                 @CookieParam('my-cookie') cookie: string): string {
        return 'cookie: ' + cookie + '|header: '+header;
    }

    @POST
    @Path('multi-param')
    testMultiParam( @Param('param') param: string): string {
        return param;
    }

    @GET
    @Path('context')
    testContext( @QueryParam('q') q: string,
        @ContextRequest request: express.Request,
        @ContextResponse response: express.Response,
        @ContextNext next: express.NextFunction): void {

        if (request && response && next) {
            response.status(201);
            if (q === '123') {
                response.send(true);
            }
            else{
                response.send(false);
            }
        }
    }

    @GET
    @Path('default-query')
    testDefaultQuery( @QueryParam('limit') limit: number = 20,
                      @QueryParam('prefix') prefix: string = 'default',
                      @QueryParam('expand') expand: boolean = true): string {
        return `limit:${limit}|prefix:${prefix}|expand:${expand}`;
    }

    @GET
    @Path('optional-query')
    testOptionalQuery( @QueryParam('limit') limit?: number,
                       @QueryParam('prefix') prefix?: string,
                       @QueryParam('expand') expand?: boolean): string {
        return `limit:${limit}|prefix:${prefix}|expand:${expand}`;
    }

    @POST
    @Path('upload')
    testUploadFile( @FileParam('myFile') file: Express.Multer.File, 
                    @FormParam('myField') myField: string): boolean {
        return (file 
         && (_.startsWith(file.buffer.toString(),'\'use strict\';')) 
         && (myField === 'my_value'));
    }
}

@Path('download')
export class TestDownload {
    @GET
    testDownloadFile(): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject)=>{
            fs.readFile(__dirname + '/apis.ts', (err, data)=>{
                if (err) {
                    return reject(err);
                }
                return resolve(new Return.DownloadBinaryData(data, 'application/javascript', 'test-rest.spec.js'))
            });
        });
    }

    @Path('ref')
    @GET
    testDownloadFile2(): Promise<Return.DownloadResource> {
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            resolve(new Return.DownloadResource(__dirname + '/apis.ts', 'test-rest.spec.js'));
        });
    }
}

@Path('/accept')
@AcceptLanguage('en', 'pt-BR')
export class AcceptTest {

    @GET
    testLanguage(@ContextLanguage language: string): string {
        if (language === 'en') {
            return 'accepted';
        }
        return 'aceito';
    }

    @GET
    @AcceptLanguage('fr')
    @Path('fr')
    testLanguageFr(@ContextLanguage language: string): string {
        if (language === 'fr') {
            return 'OK';
        }
        return 'NOT OK';
    }

    @GET
    @Path('types')
    @Accept('application/json')
    testAccepts(@ContextAccept type: string): string {
        if (type === 'application/json') {
            return 'accepted';
        }
        return 'not accepted'
    }

    @PUT
    @Path('conflict')
    testConflict(): string {
        throw new Errors.ConflictError('test of conflict');
    }


    @POST
    @Path('conflict')
    testConflictAsync(): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            throw new Errors.ConflictError('test of conflict');
        });
    }
}

@Path('/reference')
export class ReferenceService {
    @Path('accepted')
    @POST
    testAccepted( p: Person): Promise<Return.RequestAccepted<void>> {
        return new Promise<Return.RequestAccepted<void>>(function(resolve, reject){
            resolve(new Return.RequestAccepted<void>(''+p.id));
        });
    }

    @Path('moved')
    @POST
    testMoved( p: Person): Promise<Return.MovedPermanently<void>> {
        return new Promise<Return.MovedPermanently<void>>(function(resolve, reject){
            resolve(new Return.MovedPermanently<void>(''+p.id));
        });
    }

    @Path('movedtemp')
    @POST
    testMovedTemp( p: Person): Promise<Return.MovedTemporarily<void>> {
        return new Promise<Return.MovedTemporarily<void>>(function(resolve, reject){
            resolve(new Return.MovedTemporarily<void>(''+p.id));
        });
    }
}

@Path('errors')
export class ErrorService {
    @Path('badrequest')
    @GET
    test1( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.BadRequestError());
        });
    }

    @Path('conflict')
    @GET
    test2( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.ConflictError());
        });
    }

    @Path('forbiden')
    @GET
    test3( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.ForbidenError());
        });
    }

    @Path('gone')
    @GET
    test4( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.GoneError());
        });
    }

    @Path('internal')
    @GET
    test5( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.InternalServerError());
        });
    }

    @Path('method')
    @GET
    test6( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.MethodNotAllowedError());
        });
    }

    @Path('notacceptable')
    @GET
    test7( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotAcceptableError());
        });
    }

    @Path('notfound')
    @GET
    test8( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotFoundError());
        });
    }

    @Path('notimplemented')
    @GET
    test9( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotImplementedError());
        });
    }

    @Path('unauthorized')
    @GET
    test10( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.UnauthorizedError());
        });
    }

    @Path('unsupportedmedia')
    @GET
    test11( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.UnsupportedMediaTypeError());
        });
    }
}


export interface DataParam {
    param1: string;
    param2: Date;
}

@Path('dateTest')
export class DateTest {

    @POST
    @BodyOptions({reviver:(key: string, value: any) =>{
        if (key == 'param2') {
            return new Date(value);
        }
        return value;
    }})
    testData(param: DataParam) {
        if ((param.param2 instanceof Date) && (param.param2.toString() === param.param1)){
            return 'OK';
        }
        return 'NOT OK';
    }
}

@AutoWired
@Path('async/test')
export class MyAsyncService {
    @GET
    async test( ) {
        let result = await this.aPromiseMethod();
        return result;
    }

    private aPromiseMethod() {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                resolve('OK');
            }, 10);
        });
    }
}

@Path('preprocessor')
export class MyPreprocessedService {
    @ContextRequest
    request: ValidatedRequest

    @Path('test')
    @POST
    @Preprocessor(validator)
    test(body) {
        return this.request.validated
    }
}

function validator(req: express.Request): ValidatedRequest {
    let ret: ValidatedRequest
    Object.assign(ret, req)
    if (req.body["userId"]) {
        ret.validated = true
        return ret
    } else {
        throw new Errors.BadRequestError('userId not present')
    }
}

interface ValidatedRequest extends express.Request {
    validated: boolean
}