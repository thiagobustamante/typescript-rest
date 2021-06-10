jest.mock('../../src/server/server-container');
jest.mock('reflect-metadata');

import { Request } from 'express';
import * as _ from 'lodash';
import 'reflect-metadata';
import { MethodParam, ParamType, ServiceClass, ServiceMethod } from '../../src/server/model/metadata';
import { HttpMethod, ServiceContext } from '../../src/server/model/server-types';
import { ServerContainer } from '../../src/server/server-container';
import * as serviceDecorators from '../../src/decorators/services';
import * as parameterDecorators from '../../src/decorators/parameters';
import * as methodDecorators from '../../src/decorators/methods';


export class TestService {
    public property: any;
    public test(param1: any) {
        return 'OK';
    }
}

const serverContainer = {
    registerServiceClass: jest.fn(),
    registerServiceMethod: jest.fn()
};

const ServerContainerGet =  ServerContainer.get as jest.Mock;
(ServerContainer as any).mockImplementation(() => serverContainer);

const reflectGetMetadataOrig = Reflect.getMetadata;
const reflectGetOwnMetadataOrig = Reflect.getOwnMetadata;

const reflectGetMetadata = jest.fn();
const reflectGetOwnMetadata = jest.fn();

describe('Decorators', () => {
    let serviceClass: ServiceClass;
    let serviceMethod: ServiceMethod;
    const propertyType = jest.fn();

    beforeAll(() => {
        Reflect.getMetadata = reflectGetMetadata;
        Reflect.getOwnMetadata = reflectGetOwnMetadata;        
    });

    beforeEach(() => {
        serviceClass = new ServiceClass(TestService);
        serviceMethod = new ServiceMethod();

        (ServerContainer.get as jest.Mock).mockReturnValue(serverContainer);
        serverContainer.registerServiceMethod.mockReturnValue(serviceMethod);
        serverContainer.registerServiceClass.mockReturnValue(serviceClass);
        reflectGetMetadata.mockReturnValue(propertyType);
        reflectGetOwnMetadata.mockReturnValue(propertyType);
    });

    afterEach(() => {
        reflectGetMetadata.mockClear();
        reflectGetOwnMetadata.mockClear();
        propertyType.mockClear();
        ServerContainerGet.mockClear();
        serverContainer.registerServiceClass.mockClear();
        serverContainer.registerServiceMethod.mockClear();
    });

    afterAll(() => {
        Reflect.getMetadata = reflectGetMetadataOrig;
        Reflect.getOwnMetadata = reflectGetOwnMetadataOrig;        
    });

    describe('Path Decorator', () => {
        it('should add a path namespace to all methods of a class', async () => {
            const path = 'test-path';
            serviceDecorators.Path(path)(TestService);

            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serviceClass.path).toEqual(path);
        });

        it('should add a path to methods of a class', async () => {
            const path = 'test-path';
            serviceDecorators.Path(path)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.path).toEqual(path);
        });

        it('should throw an error if misused', async () => {
            const path = 'test-path';

            expect(() => {
                serviceDecorators.Path(path)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).toThrow('Invalid @Path Decorator declaration.');
        });
    });

    describe('Security Decorator', () => {
        it('should add a security role to all methods of a class', async () => {
            const role = 'test-role';
            serviceDecorators.Security(role)(TestService);

            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.authenticator.default).toHaveLength(1);
            expect(serviceClass.authenticator.default).toContain(role);
        });

        it('should add a security role to methods of a class', async () => {
            const role = 'test-role';
            serviceDecorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator.default).toHaveLength(1);
            expect(serviceMethod.authenticator.default).toContain(role);
        });

        it('should add a security set of roles to methods of a class', async () => {
            const roles = ['test-role', 'tes-role2'];
            serviceDecorators.Security(roles)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator.default).toHaveLength(2);
            expect(serviceMethod.authenticator.default).toContain(roles[0]);
            expect(serviceMethod.authenticator.default).toContain(roles[1]);
        });

        it('should add a security validation to accept any role when empty is received', async () => {
            const role = '';
            serviceDecorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator.default).toHaveLength(1);
            expect(serviceMethod.authenticator.default).toContain('*');
        });

        it('should add a security validation to accept any role when undefined is received', async () => {
            const role: string = undefined;
            serviceDecorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator.default).toHaveLength(1);
            expect(serviceMethod.authenticator.default).toContain('*');
        });

        it('should set the default authenticator if no name is provided', async () => {
            const role: string = 'test-role';
            serviceDecorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator.default).toHaveLength(1);
            expect(serviceMethod.authenticator.default).toContain(role);
            expect(Object.keys(serviceMethod.authenticator)).toEqual(['default']);
        });

        it('should set the authenticator name, when name is provided', async () => {
            const role: string = 'test-role';
            const name: string = 'authenticator-name';
            serviceDecorators.Security(role, name)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.authenticator[name]).toHaveLength(1);
            expect(serviceMethod.authenticator[name]).toContain(role);
            expect(Object.keys(serviceMethod.authenticator)).toEqual([name]);
        });

        it('should set multiple authenticator names', async () => {
            const role1: string = 'test-role-1';
            const role2: string = 'test-role-2';
            const name1: string = 'authenticator-name-1';
            const name2: string = 'authenticator-name-2';
            serviceDecorators.Security(role1, name1)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            serviceDecorators.Security(role2, name2)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(2);
            expect(serviceMethod.authenticator[name1]).toHaveLength(1);
            expect(serviceMethod.authenticator[name2]).toHaveLength(1);
            expect(serviceMethod.authenticator[name1]).toContain(role1);
            expect(serviceMethod.authenticator[name2]).toContain(role2);
            expect(Object.keys(serviceMethod.authenticator)).toHaveLength(2);
            expect(Object.keys(serviceMethod.authenticator)).toEqual([name1, name2]);
        });

        it('should throw an error if misused', async () => {
            const role = 'test-role';

            expect(() => {
                serviceDecorators.Security(role)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).toThrow('Invalid @Security Decorator declaration.');
        });
    });

    [
        { name: 'PreProcessor', property: 'preProcessors' },
        { name: 'PostProcessor', property: 'postProcessors' }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            const processor = (req: Request) => {
                return;
            };
            it('should add a ServiceProcessor to all methods of a class', async () => {
                (serviceDecorators as any)[test.name](processor)(TestService);

                expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
                expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
                expect(serviceClass[test.property]).toHaveLength(1);
                expect(serviceClass[test.property]).toContain(processor);
            });

            it('should add a ServiceProcessor to methods of a class', async () => {
                (serviceDecorators as any)[test.name](processor)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

                expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
                expect(serviceMethod[test.property]).toHaveLength(1);
                expect(serviceMethod[test.property]).toContain(processor);
            });

            it('should throw an error if misused', async () => {
                expect(() => {
                    (serviceDecorators as any)[test.name](processor)(TestService.prototype, 'test',
                        Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives undefined preprocessor', async () => {
                expect(() => {
                    (serviceDecorators as any)[test.name](undefined)(TestService.prototype, 'test',
                        Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });
        });
    });

    describe('AcceptLanguage Decorator', () => {
        it('should add an accepted language to all methods of a class', async () => {
            serviceDecorators.AcceptLanguage('en')(TestService);

            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.languages).toHaveLength(1);
            expect(serviceClass.languages).toContain('en');
        });

        it('should add an accepted language to methods of a class', async () => {
            serviceDecorators.AcceptLanguage('en')(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.languages).toHaveLength(1);
            expect(serviceMethod.languages).toContain('en');
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                serviceDecorators.AcceptLanguage('en')(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).toThrow('Invalid @AcceptLanguage Decorator declaration.');
        });

        it('should ignore falsey values of accepted languages', async () => {
            serviceDecorators.AcceptLanguage(null, 'en', undefined, 0 as any, false as any, 'pt')(TestService);

            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.languages).toHaveLength(2);
            expect(serviceClass.languages).toContain('en');
            expect(serviceClass.languages).toContain('pt');
        });

        it('should throw an error if receives undefined', async () => {
            expect(() => {
                serviceDecorators.AcceptLanguage(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).toThrow('Invalid @AcceptLanguage Decorator declaration.');
        });

        it('should throw an error if receives nothing', async () => {
            expect(() => {
                serviceDecorators.AcceptLanguage()(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).toThrow('Invalid @AcceptLanguage Decorator declaration.');
        });
    });

    describe('Accept Decorator', () => {
        it('should add an accepted content type to all methods of a class', async () => {
            serviceDecorators.Accept('application/json')(TestService);

            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.accepts).toHaveLength(1);
            expect(serviceClass.accepts).toContain('application/json');
        });

        it('should add an accepted content type to methods of a class', async () => {
            serviceDecorators.Accept('application/json')(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.accepts).toHaveLength(1);
            expect(serviceMethod.accepts).toContain('application/json');
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                serviceDecorators.Accept('application/json')(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).toThrow('Invalid @Accept Decorator declaration.');
        });

        it('should ignore falsey values of content types', async () => {
            serviceDecorators.Accept(null, 'application/json', undefined, 0 as any, false as any, 'application/xml')
                (TestService);

            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.accepts).toHaveLength(2);
            expect(serviceClass.accepts).toContain('application/json');
            expect(serviceClass.accepts).toContain('application/xml');
        });

        it('should throw an error if receives undefined', async () => {
            expect(() => {
                serviceDecorators.Accept(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).toThrow('Invalid @Accept Decorator declaration.');
        });

        it('should throw an error if receives nothing', async () => {
            expect(() => {
                serviceDecorators.Accept()(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).toThrow('Invalid @Accept Decorator declaration.');
        });
    });

    [
        { name: 'Context', paramType: ParamType.context },
        { name: 'ContextRequest', paramType: ParamType.context_request },
        { name: 'ContextResponse', paramType: ParamType.context_response },
        { name: 'ContextNext', paramType: ParamType.context_next },
        { name: 'ContextLanguage', paramType: ParamType.context_accept_language },
        { name: 'ContextAccept', paramType: ParamType.context_accept }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            it(`should bind the @${test.name} to one service property`, async () => {
                const propertyName = 'property';
                (parameterDecorators as any)[test.name](TestService, propertyName);

                validateDecoratedProperty(propertyName, test.paramType, null);
            });

            it(`should bind the @${test.name} to one method parameter`, async () => {
                const paramName = 'param1';
                reflectGetOwnMetadata.mockReturnValue([ServiceContext]);
                (parameterDecorators as any)[test.name](TestService, paramName, 0);

                validateDecoratedParameter(paramName, 1);
                validateServiceMethodParameter(ServiceContext, test.paramType, 0, null);
            });

            it('should throw an error if misused', async () => {
                expect(() => {
                    (parameterDecorators as any)[test.name](TestService, 'param1', 0, 'extra-param');
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });
        });
    });

    [
        { name: 'PathParam', paramType: ParamType.path },
        { name: 'FileParam', paramType: ParamType.file },
        { name: 'FilesParam', paramType: ParamType.files },
        { name: 'QueryParam', paramType: ParamType.query },
        { name: 'HeaderParam', paramType: ParamType.header },
        { name: 'CookieParam', paramType: ParamType.cookie },
        { name: 'FormParam', paramType: ParamType.form },
        { name: 'Param', paramType: ParamType.param }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            it(`should bind a @${test.name} to one service property`, async () => {
                const propertyName = 'property';
                const name = 'name';
                (parameterDecorators as any)[test.name](name)(TestService, propertyName);

                validateDecoratedProperty(propertyName, test.paramType, name);
            });

            it(`should bind a @${test.name} to one method parameter`, async () => {
                const paramName = 'param1';
                const name = 'name';
                reflectGetOwnMetadata.mockReturnValue([ServiceContext]);
                (parameterDecorators as any)[test.name](name)(TestService, paramName, 0);

                validateDecoratedParameter(paramName, 1);
                validateServiceMethodParameter(ServiceContext, test.paramType, 0, name);
            });

            it('should throw an error if misused', async () => {
                expect(() => {
                    (parameterDecorators as any)[test.name]('name')(TestService, 'param1', 0, 'extra-param');
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives empty name', async () => {
                const paramName = 'param1';
                const name: string = '';
                expect(() => {
                    (parameterDecorators as any)[test.name](name)(TestService, paramName, 0);
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives null name', async () => {
                const paramName = 'param1';
                const name: string = null;
                expect(() => {
                    (parameterDecorators as any)[test.name](name)(TestService, paramName, 0);
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives undefined name', async () => {
                const paramName = 'param1';
                const name: string = undefined;
                expect(() => {
                    (parameterDecorators as any)[test.name](name)(TestService, paramName, 0);
                }).toThrow(`Invalid @${test.name} Decorator declaration.`);
            });
        });
    });

    describe('Abstract Decorator', () => {
        it('should bind a class, markint it as Abstract', async () => {
            serviceDecorators.Abstract(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
            expect(serviceClass.isAbstract).toBeTruthy();
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                serviceDecorators.Abstract(TestService, 'extra-param');
            }).toThrow(`Invalid @Abstract Decorator declaration.`);
        });
    });

    describe('IgnoreNextMiddlewares Decorator', () => {
        it('should bind a class, making server does not call next function after invocations', async () => {
            serviceDecorators.IgnoreNextMiddlewares(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledWith(TestService);
            expect(serverContainer.registerServiceClass).toBeCalledTimes(1);            
            expect(serviceClass.ignoreNextMiddlewares).toBeTruthy();
        });

        it('should bind a method, making server does not call next function after invocations', async () => {
            const methodName = 'test';
            serviceDecorators.IgnoreNextMiddlewares(TestService.prototype, methodName,
                Object.getOwnPropertyDescriptor(TestService.prototype, methodName));

            expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
            expect(serviceMethod.ignoreNextMiddlewares).toBeTruthy();
        });

        it('should throw an error if misused', async () => {
            const methodName = 'test';
            expect(() => {
                serviceDecorators.IgnoreNextMiddlewares(TestService.prototype, methodName,
                    Object.getOwnPropertyDescriptor(TestService.prototype, methodName), 'extra-param');
            }).toThrow(`Invalid @IgnoreNextMiddlewares Decorator declaration.`);
        });
    });

    [
        { name: 'GET', method: HttpMethod.GET },
        { name: 'POST', method: HttpMethod.POST },
        { name: 'PUT', method: HttpMethod.PUT },
        { name: 'DELETE', method: HttpMethod.DELETE },
        { name: 'HEAD', method: HttpMethod.HEAD },
        { name: 'OPTIONS', method: HttpMethod.OPTIONS },
        { name: 'PATCH', method: HttpMethod.PATCH }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            it(`should bind the HTTP ${test.name} verb to one service method`, async () => {
                const methodName = 'test';

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(serverContainer.registerServiceMethod).toBeCalledWith(TestService.constructor, methodName);
                expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
                expect(reflectGetOwnMetadata).toBeCalledWith('design:paramtypes', TestService, methodName);
                expect(reflectGetOwnMetadata).toBeCalledTimes(1);

                expect(serviceMethod.httpMethod).toEqual(test.method);
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a body param`, async () => {
                const methodName = 'test';

                reflectGetOwnMetadata.mockReturnValue([String]);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(serviceMethod.mustParseBody).toBeTruthy();
                expect(serviceMethod.mustParseCookies).toBeFalsy();
                expect(serviceMethod.mustParseForms).toBeFalsy();
                expect(serviceMethod.acceptMultiTypedParam).toBeFalsy();
                expect(serviceMethod.parameters).toHaveLength(1);
                expect(serviceMethod.parameters[0].name).toBeNull();
                expect(serviceMethod.parameters[0].type).toEqual(String);
                expect(serviceMethod.parameters[0].paramType).toEqual(ParamType.body);
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a cookie param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(name, String, ParamType.cookie)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeFalsy();
                expect(testMethod.mustParseCookies).toBeTruthy();
                expect(testMethod.mustParseForms).toBeFalsy();
                expect(testMethod.acceptMultiTypedParam).toBeFalsy();
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a file param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(name, String, ParamType.file)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeFalsy();
                expect(testMethod.mustParseCookies).toBeFalsy();
                expect(testMethod.mustParseForms).toBeFalsy();
                expect(testMethod.acceptMultiTypedParam).toBeFalsy();
                expect(testMethod.files).toHaveLength(1);
                expect(testMethod.files[0].name).toEqual(name);
                expect(testMethod.files[0].singleFile).toBeTruthy();
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a files param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(name, String, ParamType.files)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeFalsy();
                expect(testMethod.mustParseCookies).toBeFalsy();
                expect(testMethod.mustParseForms).toBeFalsy();
                expect(testMethod.acceptMultiTypedParam).toBeFalsy();
                expect(testMethod.files).toHaveLength(1);
                expect(testMethod.files[0].name).toEqual(name);
                expect(testMethod.files[0].singleFile).toBeFalsy();
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a multi type param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(name, String, ParamType.param)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeFalsy();
                expect(testMethod.mustParseCookies).toBeFalsy();
                expect(testMethod.mustParseForms).toBeFalsy();
                expect(testMethod.acceptMultiTypedParam).toBeTruthy();
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a form param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(name, String, ParamType.form)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeFalsy();
                expect(testMethod.mustParseCookies).toBeFalsy();
                expect(testMethod.mustParseForms).toBeTruthy();
                expect(testMethod.acceptMultiTypedParam).toBeFalsy();
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a multiples params`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters.push(
                    new MethodParam(`${name}1`, String, ParamType.cookie),
                    new MethodParam(`${name}2`, String, ParamType.path),
                    new MethodParam(`${name}3`, String, ParamType.param),
                    new MethodParam(`${name}4`, String, ParamType.body)
                );
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                (methodDecorators as any)[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).toBeTruthy();
                expect(testMethod.mustParseCookies).toBeTruthy();
                expect(testMethod.mustParseForms).toBeFalsy();
                expect(testMethod.acceptMultiTypedParam).toBeTruthy();
            });

            it('should throw an error if more than one body param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters
                    .push(new MethodParam(`${name}1`, String, ParamType.body));
                testMethod.parameters
                    .push(new MethodParam(`${name}2`, String, ParamType.body));
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                expect(() => {
                    (methodDecorators as any)[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).toThrow('Can not use more than one body parameter on the same method.');
            });

            it('should throw an error if has a body and a form param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters
                    .push(new MethodParam(`${name}1`, String, ParamType.body));
                testMethod.parameters
                    .push(new MethodParam(`${name}2`, String, ParamType.form));
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                expect(() => {
                    (methodDecorators as any)[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).toThrow('Can not use form parameters with a body parameter on the same method.');
            });

            it('should throw an error if has a form and a body param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new ServiceMethod();
                testMethod.parameters
                    .push(new MethodParam(`${name}1`, String, ParamType.form));
                testMethod.parameters
                    .push(new MethodParam(`${name}2`, String, ParamType.body));
                serverContainer.registerServiceMethod.mockReturnValue(testMethod);

                expect(() => {
                    (methodDecorators as any)[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).toThrow('Can not use form parameters with a body parameter on the same method.');
            });
        });
    });

    describe('Multiple Verb Decorators', () => {
        it(`should throw an error if present on same method`, async () => {
            const methodName = 'test';

            expect(() => {
                methodDecorators.GET(TestService, methodName);
                methodDecorators.POST(TestService, methodName);
            }).toThrow('Method is already annotated with @GET. You can only map a method to one HTTP verb.');
        });

        it(`should ignore duplications of the same HTTP verb annotation`, async () => {
            const methodName = 'test';

            methodDecorators.GET(TestService, methodName);
            methodDecorators.GET(TestService, methodName);

            expect(reflectGetOwnMetadata).toBeCalledWith('design:paramtypes', TestService, methodName);
            expect(reflectGetOwnMetadata).toBeCalledTimes(1);

            expect(serviceMethod.httpMethod).toEqual(HttpMethod.GET);
        });
    });

    function validateDecoratedProperty(propertyName: string, paramType: ParamType, name: string) {
        expect(serverContainer.registerServiceClass).toBeCalledWith(TestService.constructor);
        expect(serverContainer.registerServiceClass).toBeCalledTimes(1);
        expect(reflectGetMetadata).toBeCalledWith('design:type', TestService, propertyName);
        expect(reflectGetMetadata).toBeCalledTimes(1);

        expect(serviceClass.properties.keys()).toContain(propertyName);
        const property = serviceClass.properties.get(propertyName);
        expect(property.name).toEqual(name);
        expect(property.propertyType).toEqual(propertyType);
        expect(property.type).toEqual(paramType);
    }

    function validateDecoratedParameter(paramName: string, numParameters: number) {
        expect(serverContainer.registerServiceMethod).toBeCalledWith(TestService.constructor, paramName);
        expect(serverContainer.registerServiceMethod).toBeCalledTimes(1);
        expect(reflectGetOwnMetadata).toBeCalledWith('design:paramtypes', TestService, paramName);
        expect(reflectGetOwnMetadata).toBeCalledTimes(1);

        expect(serviceMethod.parameters).toHaveLength(numParameters);
    }

    function validateServiceMethodParameter(type: any,
        paramType: ParamType,
        paramIndex: number, name: string) {
        const param = serviceMethod.parameters[paramIndex];
        expect(param.name).toEqual(name);
        expect(param.type).toEqual(type);
        expect(param.paramType).toEqual(paramType);
    }
});