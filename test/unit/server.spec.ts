jest.mock('../../src/server/server-container');

import * as _ from 'lodash';
import { Server } from '../../src/server/server';
import { ServerContainer } from '../../src/server/server-container';

const server: any = {};
const get = ServerContainer.get as jest.Mock;

describe('Server', () => {
    beforeAll(() => {
        get.mockReturnValue(server);
    });

    afterEach(() => {
        get.mockClear();
        Server.immutable(false);
    });

    it('should be able to define a custom cookie secret', async () => {
        const secret = 'my-secret';
        Server.setCookiesSecret(secret);

        expect(get).toBeCalledTimes(1);
        expect(server.cookiesSecret).toEqual(secret);
    });

    it('should be able to define a custom cookie decoder', async () => {
        const decoder = jest.fn();
        Server.setCookiesDecoder(decoder);

        expect(get).toBeCalledTimes(1);
        expect(server.cookiesDecoder).toEqual(decoder);
    });

    it('should be able to define a custom destination folder for uploaded files', async () => {
        const target = './target-dir';
        Server.setFileDest(target);

        expect(get).toBeCalledTimes(1);
        expect(server.fileDest).toEqual(target);
    });

    it('should be able to define a custom filter for uploaded files', async () => {
        const filter = jest.fn();
        Server.setFileFilter(filter);

        expect(get).toBeCalledTimes(1);
        expect(server.fileFilter).toEqual(filter);
    });

    it('should be able to define a custom limit for uploaded files', async () => {
        const limits = {
            fieldNameSize: 100,
            fieldSize: 1024,
            fields: 3000,
            fileSize: 3000,
            files: 1000,
            headerPairs: 30,
            parts: 100
        };
        Server.setFileLimits(limits);

        expect(get).toBeCalledTimes(1);
        expect(server.fileLimits).toEqual(limits);
    });


    it('should ignore change requests when immutable', async () => {
        Server.immutable(true);
        Server.setCookiesSecret(null);
        Server.registerAuthenticator(null);
        Server.registerServiceFactory('test');
        Server.setCookiesDecoder(null);
        Server.setFileDest('test');
        Server.setFileFilter(null);
        Server.setFileLimits(null);
        Server.addParameterConverter(null, null);
        Server.removeParameterConverter(null);
        Server.ignoreNextMiddlewares(false);
        expect(get).toBeCalledTimes(0);
        expect(Server.isImmutable()).toBeTruthy();
    });

});