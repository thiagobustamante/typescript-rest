'use strict';
/* tslint:disable */
import * as express from 'express';
import {Inject, AutoWired} from 'typescript-ioc';
import * as fs from 'fs';
import * as _ from 'lodash';

import {Path, Server, GET, POST, PUT,
        PathParam, QueryParam, CookieParam, HeaderParam,
        FormParam, Param, Context, ServiceContext, ContextRequest,
        ContextResponse, ContextLanguage, ContextAccept,
        ContextNext, AcceptLanguage, Accept, FileParam,
        Errors, Return, BodyOptions} from '../../src/typescript-rest';

Server.useIoC();

export class Person {
    constructor(id: number, name: string, age: number) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
    id: number;
    name: string;
    age: number;
}

@AutoWired
class InjectableObject {

}

@AutoWired
@Path('ioctest')
class MyIoCService {
    @Inject
    private injectedObject: InjectableObject
    
    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}

@Path('ioctest2')
@AutoWired
class MyIoCService2 {
    @Inject
    private injectedObject: InjectableObject
    
    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}


@Path('ioctest3')
@AutoWired
class MyIoCService3 {
    private injectedObject: InjectableObject

    constructor(@Inject injectedObject: InjectableObject) {
        this.injectedObject = injectedObject;
    }

    @GET
    test( ): string {
        return (this.injectedObject)?'OK':'NOT OK';
    }
}

@Path('mypath')
class MyService {
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
class MyService2 {
    @GET
    @Path('secondpath')
    test( ): string {
        return 'OK';
    }
}

@Path('/asubpath/person')
class PersonService {
    @Path(':id')
    @GET
    getPerson( @PathParam('id') id: number): Promise<Person> {
        return new Promise<Person>(function(resolve, reject){
            resolve(new Person(id, 'Fulano de Tal número ' + id.toString(), 35));
        });
    }

    @PUT
    @Path('/:id')
    setPerson( person: Person): boolean {
        return true;
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

class TestParams {
    
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
class TestDownload {
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
class AcceptTest {

    @GET
    testLanguage(@ContextLanguage language: string): string {
        if (language === 'en') {
            return 'accepted';
        }
        return 'aceito';
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
class ReferenceService {
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
class ErrorService {
    @Path('badrequest')
    @GET
    test1( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.BadRequestError('test'));
        });
    }

    @Path('conflict')
    @GET
    test2( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.ConflictError('test'));
        });
    }

    @Path('forbiden')
    @GET
    test3( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.ForbidenError('test'));
        });
    }

    @Path('gone')
    @GET
    test4( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.GoneError('test'));
        });
    }

    @Path('internal')
    @GET
    test5( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.InternalServerError('test'));
        });
    }

    @Path('method')
    @GET
    test6( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.MethodNotAllowedError('test'));
        });
    }

    @Path('notacceptable')
    @GET
    test7( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotAcceptableError('test'));
        });
    }

    @Path('notfound')
    @GET
    test8( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotFoundError('test'));
        });
    }

    @Path('notimplemented')
    @GET
    test9( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.NotImplementedError('test'));
        });
    }

    @Path('unauthorized')
    @GET
    test10( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.UnauthorizedError('test'));
        });
    }

    @Path('unsupportedmedia')
    @GET
    test11( p: Person): Promise<string> {
        return new Promise<string>(function(resolve, reject){
            reject(new Errors.UnsupportedMediaTypeError('test'));
        });
    }
}


interface DataParam {
    param1: string;
    param2: Date;
}

@Path('dateTest')
class DateTest {

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

let server: any;

export function startApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let app: express.Application = express();
        app.set('env', 'test');
        Server.buildServices(app, MyIoCService, MyIoCService2, MyIoCService3, MyService, MyService2, PersonService, 
							TestParams, TestDownload, AcceptTest, DateTest, ReferenceService, ErrorService);
        Server.swagger(app, './test/data/swagger.yaml', 'api-docs', 'localhost:5674', ['http']);
        server = app.listen(5674, (err: any) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export function stopApi(){
    if (server) {
        server.close();
    }
}
