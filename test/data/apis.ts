'use strict';
/* tslint:disable */
import * as express from 'express';
import * as _ from 'lodash';

import {
    Path, GET, POST, PUT, DELETE,
    PathParam, QueryParam,
    Context, ServiceContext, ContextRequest,
    ContextLanguage, ContextAccept,
    AcceptLanguage, Accept,
    Errors, Return, BodyOptions, Abstract
} from '../../src/typescript-rest';

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
            return 'OK_' + id;
        }
        return 'false';
    }

    @GET
    @Path('overload/:id')
    testOverloadGet(@PathParam('id') id: string) {
        if (context) {
            return 'OK_' + id;
        }
        return 'false';
    }

    @PUT
    @Path('overload/:id')
    testOverloadPut(@PathParam('id') id: string) {
        if (context) {
            return 'OK_' + id;
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
            return 'superclass_OK_' + id;
        }
        return 'false';
    }

    @PUT
    @Path('overload/:id')
    testOverloadPut(@PathParam('id') id: string) {
        if (context) {
            return 'superclass_OK_' + id;
        }
        return 'false';
    }
}

@Path('mypath')
export class MyService {
    @GET
    test(): string {
        return 'OK';
    }

    @GET
    @Path('secondpath')
    test2(): string {
        return 'OK';
    }
}

@Path('mypath2')
export class MyService2 {
    @GET
    @Path('secondpath')
    test(): string {
        return 'OK';
    }

    @DELETE
    @Path('secondpath')
    testDelete(): string {
        return 'OK';
    }
}

@Path('/asubpath/person')
export class PersonService {
    @Path(':id')
    @GET
    getPerson(@PathParam('id') id: number): Promise<Person> {
        return new Promise<Person>(function (resolve, reject) {
            resolve(new Person(id, 'Fulano de Tal número ' + id.toString(), 35));
        });
    }

    @PUT
    @Path('/:id')
    setPerson(person: Person): number {
        return person.salary;
    }

    @POST
    @BodyOptions({ limit: '100kb' })
    addPerson(@ContextRequest req: express.Request, person: Person): Return.NewResource<{ id: number }> {
        return new Return.NewResource<{ id: number }>(req.url + '/' + person.id, { id: person.id });
    }

    @GET
    getAll(@QueryParam('start') start: number,
        @QueryParam('size') size: number): Person[] {
        let result: Array<Person> = new Array<Person>();

        for (let i: number = start; i < (start + size); i++) {
            result.push(new Person(i, 'Fulano de Tal número ' + i.toString(), 35));
        }
        return result;
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
        return new Promise<string>(function (resolve, reject) {
            throw new Errors.ConflictError('test of conflict');
        });
    }
}

@Path('/reference')
export class ReferenceService {
    @Path('accepted')
    @POST
    testAccepted(p: Person): Promise<Return.RequestAccepted<void>> {
        return new Promise<Return.RequestAccepted<void>>(function (resolve, reject) {
            resolve(new Return.RequestAccepted<void>('' + p.id));
        });
    }

    @Path('moved')
    @POST
    testMoved(p: Person): Promise<Return.MovedPermanently<void>> {
        return new Promise<Return.MovedPermanently<void>>(function (resolve, reject) {
            resolve(new Return.MovedPermanently<void>('' + p.id));
        });
    }

    @Path('movedtemp')
    @POST
    testMovedTemp(p: Person): Promise<Return.MovedTemporarily<void>> {
        return new Promise<Return.MovedTemporarily<void>>(function (resolve, reject) {
            resolve(new Return.MovedTemporarily<void>('' + p.id));
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
    @BodyOptions({
        reviver: (key: string, value: any) => {
            if (key == 'param2') {
                return new Date(value);
            }
            return value;
        }
    })
    testData(param: DataParam) {
        if ((param.param2 instanceof Date) && (param.param2.toString() === param.param1)) {
            return 'OK';
        }
        return 'NOT OK';
    }
}

@Path('async/test')
export class MyAsyncService {
    @GET
    async test() {
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
