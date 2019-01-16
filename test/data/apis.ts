'use strict';

import * as _ from 'lodash';

import { GET, Path } from '../../src/typescript-rest';


@Path('simplepath')
export class SimpleService {
    @GET
    public test(): string {
        return 'simpleservice';
    }

    @GET
    @Path('secondpath')
    public test2(): string {
        return 'simpleservice';
    }
}
