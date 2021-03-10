'use strict';

import * as debug from 'debug';
import { Errors } from '../typescript-rest';
import { ParamType, ServiceProperty } from './model/metadata';
import { ParameterConverter, ServiceContext } from './model/server-types';
import { ServerContainer } from './server-container';

type ParameterContextMapper = (context: ServiceContext, property: ServiceProperty) => any;

export class ParameterProcessor {
    public static get() {
        return ParameterProcessor.instance;
    }
    private static instance = new ParameterProcessor();
    private static defaultParamConverter: ParameterConverter = (p: any) => p;

    private parameterMapper: Map<ParamType, ParameterContextMapper>;
    private debugger = {
        build: debug('typescript-rest:parameter-processor:build'),
        runtime: debug('typescript-rest:parameter-processor:runtime')
    };

    private constructor() {
        this.parameterMapper = this.initializeParameterMappers();
    }

    public processParameter(context: ServiceContext, property: ServiceProperty) {
        const processor = this.parameterMapper.get(property.type);
        if (!processor) {
            throw new Errors.BadRequestError('Invalid parameter type');
        }
        return processor(context, property);
    }

    private initializeParameterMappers() {
        this.debugger.build('Initializing parameters processors');
        const parameterMapper: Map<ParamType, ParameterContextMapper> = new Map();

        parameterMapper.set(ParamType.path, (context, property) => this.convertType(context.request.params[property.name], property.propertyType));
        parameterMapper.set(ParamType.query, (context, property) => this.convertType(context.request.query[property.name] as string, property.propertyType));
        parameterMapper.set(ParamType.header, (context, property) => this.convertType(context.request.header(property.name), property.propertyType));
        parameterMapper.set(ParamType.cookie, (context, property) => this.convertType(context.request.cookies[property.name], property.propertyType));
        parameterMapper.set(ParamType.body, (context, property) => this.convertType(context.request.body, property.propertyType));
        parameterMapper.set(ParamType.file, (context, property) => {
            this.debugger.runtime('Processing file parameter');
            // @ts-ignore
            const files: Array<Express.Multer.File> = context.request.files ? context.request.files[property.name] : null;
            if (files && files.length > 0) {
                return files[0];
            }
            return null;
        });
        parameterMapper.set(ParamType.files, (context, property) => {
            this.debugger.runtime('Processing files parameter');
            // @ts-ignore
            return context.request.files[property.name];
        });
        parameterMapper.set(ParamType.form, (context, property) => this.convertType(context.request.body[property.name], property.propertyType));
        parameterMapper.set(ParamType.param, (context, property) => {
            const paramValue = context.request.body[property.name] ||
                context.request.query[property.name];
            return this.convertType(paramValue, property.propertyType);
        });
        parameterMapper.set(ParamType.context, (context) => context);
        parameterMapper.set(ParamType.context_request, (context) => context.request);
        parameterMapper.set(ParamType.context_response, (context) => context.response);
        parameterMapper.set(ParamType.context_next, (context) => context.next);
        parameterMapper.set(ParamType.context_accept, (context) => context.accept);
        parameterMapper.set(ParamType.context_accept_language, (context) => context.language);

        return parameterMapper;
    }

    private convertType(paramValue: string | boolean, paramType: Function): any {
        const serializedType = paramType['name'];
        this.debugger.runtime('Processing parameter. received type: %s, received value:', serializedType, paramValue);
        switch (serializedType) {
            case 'Number':
                return paramValue === undefined ? paramValue : parseFloat(paramValue as string);
            case 'Boolean':
                return paramValue === undefined ? paramValue : paramValue === 'true' || paramValue === true;
            default:
                let converter = ServerContainer.get().paramConverters.get(paramType);
                if (!converter) {
                    converter = ParameterProcessor.defaultParamConverter;
                }

                return converter(paramValue);
        }
    }
}

