'use strict';

import * as chai from 'chai';
import * as _ from 'lodash';
import 'mocha';
import * as proxyquire from 'proxyquire';
import { Request } from 'request';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as metadata from '../../src/metadata';

chai.use(sinonChai);
const expect = chai.expect;

export class TestService {
    public test() {
        return 'OK';
    }
}

// tslint:disable:no-unused-expression
describe('Decorators', () => {
    let serverStub: sinon.SinonStubbedInstance<any>;
    let decorators: any;
    let serviceClass: metadata.ServiceClass;
    let serviceMethod: metadata.ServiceMethod;

    beforeEach(() => {
        serverStub = sinon.stub({
            get: () => this,
            registerServiceClass: (target: any) => this,
            registerServiceMethod: (target: any, propertyKey: string) => this
        });

        decorators = proxyquire('../../src/decorators', {
            './server-container': { InternalServer: serverStub }
        });

        serviceClass = new metadata.ServiceClass(TestService);
        serviceMethod = new metadata.ServiceMethod();

        serverStub.registerServiceMethod.returns(serviceMethod);
        serverStub.registerServiceClass.returns(serviceClass);
        serverStub.get.returns(serverStub);
    });

    afterEach(() => {
        serverStub.registerServiceClass.restore();
        serverStub.registerServiceMethod.restore();
    });

    describe('Path Decorator', () => {
        it('should add a path namespace to all methods of a class', () => {
            const path = 'test-path';
            decorators.Path(path)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.path).to.equals(path);
        });

        it('should add a path to methods of a class', () => {
            const path = 'test-path';
            decorators.Path(path)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.path).to.equals(path);
        });

        it('should throw an error if misused', () => {
            const path = 'test-path';

            expect(() => {
                decorators.Path(path)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Path Decorator declaration.');
        });
    });

    describe('Security Decorator', () => {
        it('should add a security role to all methods of a class', () => {
            const role = 'test-role';
            decorators.Security(role)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.roles).to.have.length(1);
            expect(serviceClass.roles).to.includes(role);
        });

        it('should add a security role to methods of a class', () => {
            const role = 'test-role';
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.includes(role);
        });

        it('should add a security set of roles to methods of a class', () => {
            const roles = ['test-role', 'tes-role2'];
            decorators.Security(roles)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(2);
            expect(serviceMethod.roles).to.include.members(roles);
        });


        it('should add a security validation to accept any role when empty is received', () => {
            const role = '';
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.include.members(['*']);
        });

        it('should add a security validation to accept any role when undefined is received', () => {
            const role: string = undefined;
            decorators.Security(role)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.roles).to.have.length(1);
            expect(serviceMethod.roles).to.include.members(['*']);
        });

        it('should throw an error if misused', () => {
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
        it('should add a ServicePreProcessor to all methods of a class', () => {
            decorators.Preprocessor(preprocessor)(TestService);

            expect(serverStub.registerServiceClass).to.have.been.calledOnceWithExactly(TestService);
            expect(serviceClass.preProcessors).to.have.length(1);
            expect(serviceClass.preProcessors).to.include.members([preprocessor]);
        });

        it('should add a ServicePreProcessor to methods of a class', () => {
            decorators.Preprocessor(preprocessor)(TestService.prototype, 'test',
                Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));

            expect(serverStub.registerServiceMethod).to.have.been.calledOnce;
            expect(serviceMethod.preProcessors).to.have.length(1);
            expect(serviceMethod.preProcessors).to.include.members([preprocessor]);
        });

        it('should throw an error if misused', () => {
            expect(() => {
                decorators.Preprocessor(preprocessor)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'), 'extra-arg');
            }).to.throw('Invalid @Preprocessor Decorator declaration.');
        });

        it('should throw an error if receives undefined preprocessor', () => {
            expect(() => {
                decorators.Preprocessor(undefined)(TestService.prototype, 'test',
                    Object.getOwnPropertyDescriptor(TestService.prototype, 'test'));
            }).to.throw('Invalid @Preprocessor Decorator declaration.');
        });
    });
});