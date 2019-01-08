'use strict';

import * as chai from 'chai';
import { Request } from 'express';
import * as _ from 'lodash';
import 'mocha';
import * as proxyquire from 'proxyquire';
import 'reflect-metadata';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as metadata from '../../src/metadata';
import { HttpMethod, ServiceContext } from '../../src/server-types';

chai.use(sinonChai);
const expect = chai.expect;

export class TestService {
    public property: any;
    public test(param1: any) {
        return 'OK';
    }
}

// tslint:disable:no-unused-expression
describe('Decorators', () => {
    let serverStub: sinon.SinonStubbedInstance<any>;
    let reflectGetMetadata: sinon.SinonStubbedInstance<any>;
    let reflectGetOwnMetadata: sinon.SinonStubbedInstance<any>;
    let decorators: any;
    let propertyType: sinon.SinonStub;
    let serviceClass: metadata.ServiceClass;
    let serviceMethod: metadata.ServiceMethod;

    beforeEach(() => {
        serverStub = sinon.stub({
            get: () => this,
            registerServiceClass: (target: any) => this,
            registerServiceMethod: (target: any, propertyKey: string) => this
        });
        propertyType = sinon.stub();
        reflectGetMetadata = sinon.stub(Reflect, 'getMetadata');
        reflectGetOwnMetadata = sinon.stub(Reflect, 'getOwnMetadata');

        decorators = proxyquire('../../src/decorators', {
            './server-container': { InternalServer: serverStub }
        });

        serviceClass = new metadata.ServiceClass(TestService);
        serviceMethod = new metadata.ServiceMethod();

        serverStub.registerServiceMethod.returns(serviceMethod);
        serverStub.registerServiceClass.returns(serviceClass);
        serverStub.get.returns(serverStub);
        reflectGetMetadata.returns(propertyType);
        reflectGetOwnMetadata.returns(propertyType);
    });

    afterEach(() => {
        serverStub.registerServiceClass.restore();
        serverStub.registerServiceMethod.restore();
        reflectGetMetadata.restore();
        reflectGetOwnMetadata.restore();
        serverStub.get.restore();
    });

    describe('Path Decorator', () => {
        it('should add a path namespace to all methods of a class', async () => {
            const path = 'test-path';
            decorators.Path(path)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.path).to.equals(path);
        });

        it('should add a path to methods of a class', async () => {
            const path = 'test-path';
            decorators.Path(path)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.path).to.equals(path);
        });

        it('should throw an error if misused', async () => {
            const path = 'test-path';

            expect(() => {
                decorators.Path(path)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Path Decorator declaration.');
        });
    });

    describe('Security Decorator', () => {
        it('should add a security role to all methods of a class', async () => {
            const role = 'test-role';
            decorators.Security(role)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.roles).to.have.length(1);
            expect(serviceClass.roles).to.includes(role);
        });

        it('should add a security role to methods of a class', async () => {
            const role = 'test-role';
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.includes(role);
        });

        it('should add a security set of roles to methods of a class', async () => {
            const roles = ['test-role', 'tes-role2'];
            decorators.Security(roles)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(2);
            expect(serviceMethod.roles).to.include.members(roles);
        });


        it('should add a security validation to accept any role when empty is received', async () => {
            const role = '';
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.include.members(['*']);
        });

        it('should add a security validation to accept any role when undefined is received', async () => {
            const role: string = undefined;
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.include.members(['*']);
        });

        it('should throw an error if misused', async () => {
            const role = 'test-role';

            expect(() => {
                decorators.Security(role)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Security Decorator declaration.');
        });
    });

    describe('Preprocessor Decorator', () => {
        const preprocessor = (req: Request) => {
            return;
        };
        it('should add a ServicePreProcessor to all methods of a class', async () => {
            decorators.Preprocessor(preprocessor)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.preProcessors).to.have.length(1);
            expect(serviceClass.preProcessors).to.include.members([preprocessor]);
        });

        it('should add a ServicePreProcessor to methods of a class', async () => {
            decorators.Preprocessor(preprocessor)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.preProcessors).to.have.length(1);
            expect(serviceMethod.preProcessors).to.include.members([preprocessor]);
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                decorators.Preprocessor(preprocessor)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Preprocessor Decorator declaration.');
        });

        it('should throw an error if receives undefined preprocessor', async () => {
            expect(() => {
                decorators.Preprocessor(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @Preprocessor Decorator declaration.');
        });
    });

    describe('AcceptLanguage Decorator', () => {
        it('should add an accepted language to all methods of a class', async () => {
            decorators.AcceptLanguage('en')(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.languages).to.have.length(1);
            expect(serviceClass.languages).to.include.members(['en']);
        });

        it('should add an accepted language to methods of a class', async () => {
            decorators.AcceptLanguage('en')(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.languages).to.have.length(1);
            expect(serviceMethod.languages).to.include.members(['en']);
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                decorators.AcceptLanguage('en')(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @AcceptLanguage Decorator declaration.');
        });

        it('should ignore falsey values of accepted languages', async () => {
            decorators.AcceptLanguage(null, 'en', undefined, 0, false, 'pt')(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.languages).to.have.length(2);
            expect(serviceClass.languages).to.include.members(['en', 'pt']);
        });

        it('should throw an error if receives undefined', async () => {
            expect(() => {
                decorators.AcceptLanguage(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @AcceptLanguage Decorator declaration.');
        });

        it('should throw an error if receives nothing', async () => {
            expect(() => {
                decorators.AcceptLanguage()(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @AcceptLanguage Decorator declaration.');
        });
    });

    describe('Accept Decorator', () => {
        it('should add an accepted content type to all methods of a class', async () => {
            decorators.Accept('application/json')(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.accepts).to.have.length(1);
            expect(serviceClass.accepts).to.include.members(['application/json']);
        });

        it('should add an accepted content type to methods of a class', async () => {
            decorators.Accept('application/json')(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.accepts).to.have.length(1);
            expect(serviceMethod.accepts).to.include.members(['application/json']);
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                decorators.Accept('application/json')(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Accept Decorator declaration.');
        });

        it('should ignore falsey values of content types', async () => {
            decorators.Accept(null, 'application/json', undefined, 0, false, 'application/xml')
                (TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.accepts).to.have.length(2);
            expect(serviceClass.accepts).to.include.members(['application/json', 'application/xml']);
        });

        it('should throw an error if receives undefined', async () => {
            expect(() => {
                decorators.Accept(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @Accept Decorator declaration.');
        });

        it('should throw an error if receives nothing', async () => {
            expect(() => {
                decorators.Accept()(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @Accept Decorator declaration.');
        });
    });

    [
        { name: 'Context', paramType: metadata.ParamType.context },
        { name: 'ContextRequest', paramType: metadata.ParamType.context_request },
        { name: 'ContextResponse', paramType: metadata.ParamType.context_response },
        { name: 'ContextNext', paramType: metadata.ParamType.context_next },
        { name: 'ContextLanguage', paramType: metadata.ParamType.context_accept_language },
        { name: 'ContextAccept', paramType: metadata.ParamType.context_accept }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            it(`should bind the @${test.name} to one service property`, async () => {
                const propertyName = 'property';
                decorators[test.name](TestService, propertyName);

                validateDecoratedProperty(propertyName, test.paramType, null);
            });

            it(`should bind the @${test.name} to one method parameter`, async () => {
                const paramName = 'param1';
                reflectGetOwnMetadata.returns([ServiceContext]);
                decorators[test.name](TestService, paramName, 0);

                validateDecoratedParameter(paramName, 1);
                validateServiceMethodParameter(ServiceContext, test.paramType, 0, null);
            });

            it('should throw an error if misused', async () => {
                expect(() => {
                    decorators[test.name](TestService, 'param1', 0, 'extra-param');
                }).to.throw(`Invalid @${test.name} Decorator declaration.`);
            });
        });
    });

    [
        { name: 'PathParam', paramType: metadata.ParamType.path },
        { name: 'FileParam', paramType: metadata.ParamType.file },
        { name: 'FilesParam', paramType: metadata.ParamType.files },
        { name: 'QueryParam', paramType: metadata.ParamType.query },
        { name: 'HeaderParam', paramType: metadata.ParamType.header },
        { name: 'CookieParam', paramType: metadata.ParamType.cookie },
        { name: 'FormParam', paramType: metadata.ParamType.form },
        { name: 'Param', paramType: metadata.ParamType.param }
    ].forEach(test => {
        describe(`${test.name} Decorator`, () => {
            it(`should bind a @${test.name} to one service property`, async () => {
                const propertyName = 'property';
                const name = 'name';
                decorators[test.name](name)(TestService, propertyName);

                validateDecoratedProperty(propertyName, test.paramType, name);
            });

            it(`should bind a @${test.name} to one method parameter`, async () => {
                const paramName = 'param1';
                const name = 'name';
                reflectGetOwnMetadata.returns([ServiceContext]);
                decorators[test.name](name)(TestService, paramName, 0);

                validateDecoratedParameter(paramName, 1);
                validateServiceMethodParameter(ServiceContext, test.paramType, 0, name);
            });

            it('should throw an error if misused', async () => {
                expect(() => {
                    decorators[test.name]('name')(TestService, 'param1', 0, 'extra-param');
                }).to.throw(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives empty name', async () => {
                const paramName = 'param1';
                const name: string = '';
                expect(() => {
                    decorators[test.name](name)(TestService, paramName, 0);
                }).to.throw(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives null name', async () => {
                const paramName = 'param1';
                const name: string = null;
                expect(() => {
                    decorators[test.name](name)(TestService, paramName, 0);
                }).to.throw(`Invalid @${test.name} Decorator declaration.`);
            });

            it('should throw an error if receives undefined name', async () => {
                const paramName = 'param1';
                const name: string = undefined;
                expect(() => {
                    decorators[test.name](name)(TestService, paramName, 0);
                }).to.throw(`Invalid @${test.name} Decorator declaration.`);
            });
        });
    });

    describe('Abstract Decorator', () => {
        it('should bind a class, markint it as Abstract', async () => {
            decorators.Abstract(TestService);
            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.isAbstract).to.be.true;
        });

        it('should throw an error if misused', async () => {
            expect(() => {
                decorators.Abstract(TestService, 'extra-param');
            }).to.throw(`Invalid @Abstract Decorator declaration.`);
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

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(serverStub.registerServiceMethod).to.have.been
                    .calledOnceWithExactly(TestService.constructor, methodName);
                expect(reflectGetOwnMetadata).to.have.been
                    .calledOnceWithExactly('design:paramtypes', TestService, methodName);

                expect(serviceMethod.httpMethod).to.be.equals(test.method);
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a body param`, async () => {
                const methodName = 'test';

                reflectGetOwnMetadata.returns([String]);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(serviceMethod.mustParseBody).to.be.true;
                expect(serviceMethod.mustParseCookies).to.be.false;
                expect(serviceMethod.mustParseForms).to.be.false;
                expect(serviceMethod.acceptMultiTypedParam).to.be.false;
                expect(serviceMethod.parameters).to.have.length(1);
                expect(serviceMethod.parameters[0].name).to.be.null;
                expect(serviceMethod.parameters[0].type).to.be.equals(String);
                expect(serviceMethod.parameters[0].paramType).to.be.equals(metadata.ParamType.body);
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a cookie param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(name, String, metadata.ParamType.cookie)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.false;
                expect(testMethod.mustParseCookies).to.be.true;
                expect(testMethod.mustParseForms).to.be.false;
                expect(testMethod.acceptMultiTypedParam).to.be.false;
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a file param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(name, String, metadata.ParamType.file)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.false;
                expect(testMethod.mustParseCookies).to.be.false;
                expect(testMethod.mustParseForms).to.be.false;
                expect(testMethod.acceptMultiTypedParam).to.be.false;
                expect(testMethod.files).to.have.length(1);
                expect(testMethod.files[0].name).to.be.equals(name);
                expect(testMethod.files[0].singleFile).to.be.true;
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a files param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(name, String, metadata.ParamType.files)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.false;
                expect(testMethod.mustParseCookies).to.be.false;
                expect(testMethod.mustParseForms).to.be.false;
                expect(testMethod.acceptMultiTypedParam).to.be.false;
                expect(testMethod.files).to.have.length(1);
                expect(testMethod.files[0].name).to.be.equals(name);
                expect(testMethod.files[0].singleFile).to.be.false;
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a multi type param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(name, String, metadata.ParamType.param)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.false;
                expect(testMethod.mustParseCookies).to.be.false;
                expect(testMethod.mustParseForms).to.be.false;
                expect(testMethod.acceptMultiTypedParam).to.be.true;
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a form param`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(name, String, metadata.ParamType.form)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.false;
                expect(testMethod.mustParseCookies).to.be.false;
                expect(testMethod.mustParseForms).to.be.true;
                expect(testMethod.acceptMultiTypedParam).to.be.false;
            });

            it(`should bind the HTTP ${test.name} verb to one service method with a multiples params`, async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters.push(
                    new metadata.MethodParam(`${name}1`, String, metadata.ParamType.cookie),
                    new metadata.MethodParam(`${name}2`, String, metadata.ParamType.path),
                    new metadata.MethodParam(`${name}3`, String, metadata.ParamType.param),
                    new metadata.MethodParam(`${name}4`, String, metadata.ParamType.body)
                );
                serverStub.registerServiceMethod.returns(testMethod);

                decorators[test.name](TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));

                expect(testMethod.mustParseBody).to.be.true;
                expect(testMethod.mustParseCookies).to.be.true;
                expect(testMethod.mustParseForms).to.be.false;
                expect(testMethod.acceptMultiTypedParam).to.be.true;
            });

            it('should throw an error if more than one body param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}1`, String, metadata.ParamType.body));
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}2`, String, metadata.ParamType.body));
                serverStub.registerServiceMethod.returns(testMethod);

                expect(() => {
                    decorators[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).to.throw('Can not use more than one body parameter on the same method.');
            });

            it('should throw an error if has a body and a form param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}1`, String, metadata.ParamType.body));
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}2`, String, metadata.ParamType.form));
                serverStub.registerServiceMethod.returns(testMethod);

                expect(() => {
                    decorators[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).to.throw('Can not use form parameters with a body parameter on the same method.');
            });

            it('should throw an error if has a form and a body param', async () => {
                const methodName = 'test';
                const name = 'para-name';

                const testMethod = new metadata.ServiceMethod();
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}1`, String, metadata.ParamType.form));
                testMethod.parameters
                    .push(new metadata.MethodParam(`${name}2`, String, metadata.ParamType.body));
                serverStub.registerServiceMethod.returns(testMethod);

                expect(() => {
                    decorators[test.name](TestService, methodName,
                        Object.getOwnPropertyDescriptor(TestService, methodName));
                }).to.throw('Can not use form parameters with a body parameter on the same method.');
            });
        });
    });

    describe('Multiple Verb Decorators', () => {
        it(`should throw an error if present on same method`, async () => {
            const methodName = 'test';

            expect(() => {
                decorators.GET(TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));
                decorators.POST(TestService, methodName,
                    Object.getOwnPropertyDescriptor(TestService, methodName));
            }).to.throw('Method is already annotated with @GET. You can only map a method to one HTTP verb.');
        });

        it(`should ignore duplications of the same HTTP verb annotation`, async () => {
            const methodName = 'test';

            decorators.GET(TestService, methodName,
                Object.getOwnPropertyDescriptor(TestService, methodName));
            decorators.GET(TestService, methodName,
                Object.getOwnPropertyDescriptor(TestService, methodName));

            expect(reflectGetOwnMetadata).to.have.been
                .calledOnceWithExactly('design:paramtypes', TestService, methodName);

            expect(serviceMethod.httpMethod).to.be.equals(HttpMethod.GET);
        });
    });

    function validateDecoratedProperty(propertyName: string, paramType: metadata.ParamType, name: string) {
        expect(serverStub.registerServiceClass).to.have.been
            .calledOnceWithExactly(TestService.constructor);
        expect(reflectGetMetadata).to.have.been
            .calledOnceWithExactly('design:type', TestService, propertyName);

        expect(serviceClass.properties).to.have.key(propertyName);
        const property = serviceClass.properties.get(propertyName);
        expect(property.name).to.be.equals(name);
        expect(property.propertyType).to.be.equals(propertyType);
        expect(property.type).to.be.equals(paramType);
    }

    function validateDecoratedParameter(paramName: string, numParameters: number) {
        expect(serverStub.registerServiceMethod).to.have.been
            .calledOnceWithExactly(TestService.constructor, paramName);
        expect(reflectGetOwnMetadata).to.have.been
            .calledOnceWithExactly('design:paramtypes', TestService, paramName);

        expect(serviceMethod.parameters).to.have.length(numParameters);
    }

    function validateServiceMethodParameter(type: any,
        paramType: metadata.ParamType,
        paramIndex: number, name: string) {
        const param = serviceMethod.parameters[paramIndex];
        expect(param.name).to.be.equals(name);
        expect(param.type).to.be.equals(type);
        expect(param.paramType).to.be.equals(paramType);
    }
});