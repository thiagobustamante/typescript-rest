jest.mock('fs-extra');
jest.mock('../../src/server/server');

import * as _ from 'lodash';
import * as path from 'path';
import { ServerConfig } from '../../src/server/config';
import { Server } from '../../src/server/server';
import * as fs from 'fs-extra';

const registerServiceFactory = Server.registerServiceFactory as jest.Mock;
const existsSync = fs.existsSync as jest.Mock;
const readJSONSync = fs.readJSONSync as jest.Mock;

describe('ServerConfig', () => {
    afterEach(() => {
        existsSync.mockClear();
        readJSONSync.mockClear();
        registerServiceFactory.mockClear();
    });

    it('should use a custom service factory if configured', async () => {
        const config = {
            serviceFactory: 'myCustomFactory'
        };

        existsSync.mockReturnValueOnce(false);
        existsSync.mockReturnValueOnce(true);
        existsSync.mockReturnValueOnce(true);
        readJSONSync.mockReturnValue(config);
        ServerConfig.configure();

        expect(registerServiceFactory).toBeCalledWith(config.serviceFactory);
        expect(registerServiceFactory).toBeCalledTimes(1);
    });

    it('should use a custom service factory configured with relative path', async () => {
        const config = {
            serviceFactory: './myCustomFactory'
        };
        const expectedServicePath = path.join(process.cwd(), config.serviceFactory);

        existsSync.mockReturnValueOnce(false);
        existsSync.mockReturnValueOnce(true);
        existsSync.mockReturnValueOnce(true);
        readJSONSync.mockReturnValue(config);
        ServerConfig.configure();

        expect(registerServiceFactory).toBeCalledWith(expectedServicePath);
        expect(registerServiceFactory).toBeCalledTimes(1);
    });

    it('should not use ioc if an error occur while searching for config file', async () => {
        const consoleError = jest.spyOn(console, "error");
        try {
            const error = new Error("Some error");
            existsSync.mockImplementation(() => { throw error; });
            ServerConfig.configure();

            expect(registerServiceFactory).toBeCalledTimes(0);
            expect(consoleError).toBeCalledWith(error);
        } finally {
            consoleError.mockReset();
        }
    });
});