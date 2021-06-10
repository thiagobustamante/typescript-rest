jest.mock('passport');

import * as _ from 'lodash';
import { PassportAuthenticator } from '../../src/authenticator/passport';
import { wait } from 'test-wait';
import * as passport from 'passport';

const expressStub: any = 
{
    use: jest.fn()
};
const authenticate = passport.authenticate as jest.Mock;
const deserializeUser = passport.deserializeUser as jest.Mock;
const initialize = passport.initialize as jest.Mock;
const serializeUser = passport.serializeUser as jest.Mock;
const session = passport.session as jest.Mock;
const use = passport.use as jest.Mock;

describe('PassportAuthenticator', () => {
    const testStrategy: any = { name: 'test-strategy' };
    const authenticator = jest.fn();
    const initializer = jest.fn();
    const sessionHandler = jest.fn();

    beforeEach(() => {

        authenticate.mockReturnValue(authenticator);
        initialize.mockReturnValue(initializer);
        session.mockReturnValue(sessionHandler);
    });

    afterEach(() => {
        authenticate.mockClear();
        deserializeUser.mockClear();
        initialize.mockClear();
        serializeUser.mockClear();
        session.mockClear();
        use.mockClear();
        expressStub.use.mockClear();
    });

    it('should be able to create a simple authenticator with a given passport strategy', async () => {
        const auth: any = new PassportAuthenticator(testStrategy);

        expect(Object.keys(auth.options)).toHaveLength(0);
        expect(use).toBeCalledWith(testStrategy.name, testStrategy);
        expect(use).toBeCalledTimes(1);
        expect(authenticate).toBeCalledWith(testStrategy.name, expect.anything());
        expect(auth.getMiddleware()).toEqual(authenticator);
    });

    it('should be able to create a simple authenticator with default strategy name', async () => {
        const strategy: any = {};
        const auth = new PassportAuthenticator(strategy);

        expect(auth).toBeDefined();
        expect(use).toBeCalledWith('default_strategy', strategy);
        expect(use).toBeCalledTimes(1);
        expect(authenticate).toBeCalledWith('default_strategy', expect.anything());
        expect(authenticate).toBeCalledTimes(1);
    });

    it('should be able to create a simple authenticator with custom auth options', async () => {
        const options = {
            authOptions: {
                session: false
            },
            strategyName: 'my-custom-strategy'
        };
        const auth: any = new PassportAuthenticator(testStrategy, options);

        expect(auth.options).toEqual(options);
        expect(authenticate).toBeCalledWith(options.strategyName, options.authOptions);
        expect(authenticate).toBeCalledTimes(1);
    });

    it('should be able to initialize a sessionless authenticator', async () => {
        const options = {
            authOptions: {
                session: false
            }
        };
        const auth = new PassportAuthenticator(testStrategy, options);
        auth.initialize(expressStub);

        expect(initialize).toBeCalledTimes(1);
        expect(expressStub.use).toBeCalledTimes(1);
        expect(expressStub.use).toBeCalledWith(initializer);
        expect(session).toBeCalledTimes(0);
    });

    describe('Session tests', () => {
        const serializationCallbackStub = jest.fn();
        const deserializationCallbackStub = jest.fn();
        const options = {
            deserializeUser: jest.fn(),
            serializeUser: jest.fn()
        };

        afterEach(() => {
            options.deserializeUser.mockClear();
            options.serializeUser.mockClear();
            deserializationCallbackStub.mockClear();
            serializationCallbackStub.mockClear();
        });

        it('should be able to initialize an authenticator with session', async () => {
            const user = { 'id': '123', 'name': 'Joe' };
            const serialization = JSON.stringify(user);
            options.serializeUser.mockReturnValue(serialization);
            options.deserializeUser.mockReturnValue(user);

            serializeUser.mockImplementation((callback) => {
                callback(user, serializationCallbackStub);
            });
            deserializeUser.mockImplementation((callback) => {
                callback(serialization, deserializationCallbackStub);
            });
            const auth = new PassportAuthenticator(testStrategy, options);
            auth.initialize(expressStub);
            await wait(1);
            expect(initialize).toBeCalledTimes(1);
            expect(expressStub.use).toBeCalledTimes(2);
            expect(expressStub.use).toBeCalledWith(initializer);
            expect(session).toBeCalledTimes(1);
            expect(expressStub.use).toBeCalledWith(sessionHandler);
            expect(serializeUser).toBeCalledTimes(1);
            expect(deserializeUser).toBeCalledTimes(1);
            expect(serializationCallbackStub).toBeCalledWith(null, serialization);
            expect(serializationCallbackStub).toBeCalledTimes(1);
            expect(deserializationCallbackStub).toBeCalledWith(null, user);
            expect(deserializationCallbackStub).toBeCalledTimes(1);
        });

        it('should be able to fail when serialization fail', async () => {
            const user = { 'id': '123', 'name': 'Joe' };
            const serialization = JSON.stringify(user);
            const error = new Error('any error');
            options.serializeUser.mockReturnValue(Promise.reject(error));
            options.deserializeUser.mockReturnValue(Promise.reject(error));

            serializeUser.mockImplementation((callback) => {
                callback(user, serializationCallbackStub);
            });
            deserializeUser.mockImplementation((callback) => {
                callback(serialization, deserializationCallbackStub);
            });
            const auth = new PassportAuthenticator(testStrategy, options);
            auth.initialize(expressStub);
            await wait(1);
            expect(serializationCallbackStub).toBeCalledWith(error, null);
            expect(serializationCallbackStub).toBeCalledTimes(1);
            expect(deserializationCallbackStub).toBeCalledWith(error, null);
            expect(deserializationCallbackStub).toBeCalledTimes(1);
        });
    });

});