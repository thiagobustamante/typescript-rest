"use strict";
var server_container_1 = require("./server-container");
var server_types_1 = require("./server-types");
var metadata = require("./metadata");
require("reflect-metadata");
var _ = require("lodash");
function Path(path) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args = _.without(args, undefined);
        if (args.length == 1) {
            return PathTypeDecorator.apply(this, [args[0], path]);
        }
        else if (args.length == 3 && typeof args[2] === "object") {
            return PathMethodDecorator.apply(this, [args[0], args[1], args[2], path]);
        }
        throw new Error("Invalid @Path Decorator declaration.");
    };
}
exports.Path = Path;
function AcceptLanguage() {
    var languages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        languages[_i] = arguments[_i];
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args = _.without(args, undefined);
        if (args.length == 1) {
            return AcceptLanguageTypeDecorator.apply(this, [args[0], languages]);
        }
        else if (args.length == 3 && typeof args[2] === "object") {
            return AcceptLanguageMethodDecorator.apply(this, [args[0], args[1], args[2], languages]);
        }
        throw new Error("Invalid @AcceptLanguage Decorator declaration.");
    };
}
exports.AcceptLanguage = AcceptLanguage;
function Accept() {
    var accepts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        accepts[_i] = arguments[_i];
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args = _.without(args, undefined);
        if (args.length == 1) {
            return AcceptTypeDecorator.apply(this, [args[0], accepts]);
        }
        else if (args.length == 3 && typeof args[2] === "object") {
            return AcceptMethodDecorator.apply(this, [args[0], args[1], args[2], accepts]);
        }
        throw new Error("Invalid @Accept Decorator declaration.");
    };
}
exports.Accept = Accept;
function Context() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.Context = Context;
function ContextRequest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_request]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context_request, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @ContextRequest Decorator declaration.");
}
exports.ContextRequest = ContextRequest;
function ContextResponse() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_response]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context_response, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @ContextResponse Decorator declaration.");
}
exports.ContextResponse = ContextResponse;
function ContextNext() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_next]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context_next, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @ContextNext Decorator declaration.");
}
exports.ContextNext = ContextNext;
function ContextLanguage() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_accept_language]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context_accept_language, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @ContextLanguage Decorator declaration.");
}
exports.ContextLanguage = ContextLanguage;
function ContextAccept() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = _.without(args, undefined);
    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_accept]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
        var newArgs = args.concat([metadata.ParamType.context_accept, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }
    throw new Error("Invalid @ContextAccept Decorator declaration.");
}
exports.ContextAccept = ContextAccept;
function GET(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.GET);
}
exports.GET = GET;
function POST(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.POST);
}
exports.POST = POST;
function PUT(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.PUT);
}
exports.PUT = PUT;
function DELETE(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.DELETE);
}
exports.DELETE = DELETE;
function HEAD(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.HEAD);
}
exports.HEAD = HEAD;
function OPTIONS(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.OPTIONS);
}
exports.OPTIONS = OPTIONS;
function PATCH(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, server_types_1.HttpMethod.PATCH);
}
exports.PATCH = PATCH;
function PathParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.path, name);
    };
}
exports.PathParam = PathParam;
function FileParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.file, name);
    };
}
exports.FileParam = FileParam;
function FilesParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.files, name);
    };
}
exports.FilesParam = FilesParam;
function QueryParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.query, name);
    };
}
exports.QueryParam = QueryParam;
function HeaderParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.header, name);
    };
}
exports.HeaderParam = HeaderParam;
function CookieParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.cookie, name);
    };
}
exports.CookieParam = CookieParam;
function FormParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.form, name);
    };
}
exports.FormParam = FormParam;
function Param(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.param, name);
    };
}
exports.Param = Param;
function AcceptLanguageTypeDecorator(target, languages) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.languages = languages;
}
function AcceptLanguageMethodDecorator(target, propertyKey, descriptor, languages) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        serviceMethod.languages = languages;
    }
}
function AcceptTypeDecorator(target, accepts) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.accepts = accepts;
}
function AcceptMethodDecorator(target, propertyKey, descriptor, accepts) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        serviceMethod.accepts = accepts;
    }
}
function PathTypeDecorator(target, path) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.path = path;
}
function PathMethodDecorator(target, propertyKey, descriptor, path) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        serviceMethod.path = path;
    }
}
function processDecoratedParameter(target, propertyKey, parameterIndex, paramType, name) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        var paramTypes = Reflect.getOwnMetadata("design:paramtypes", target, propertyKey);
        while (serviceMethod.parameters.length < paramTypes.length) {
            serviceMethod.parameters.push(new metadata.MethodParam(null, paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
        }
        serviceMethod.parameters[parameterIndex] = new metadata.MethodParam(name, paramTypes[parameterIndex], paramType);
    }
}
function processDecoratedProperty(target, key, paramType) {
    var classData = server_container_1.InternalServer.registerServiceClass(target.constructor);
    classData.addProperty(key, paramType);
}
function processHttpVerb(target, propertyKey, httpMethod) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        if (serviceMethod.httpMethod) {
            throw new Error("Method is already annotated with @" +
                serviceMethod.httpMethod +
                ". You can only map a method to one HTTP verb.");
        }
        serviceMethod.httpMethod = httpMethod;
        processServiceMethod(target, propertyKey, serviceMethod);
    }
}
function processServiceMethod(target, propertyKey, serviceMethod) {
    serviceMethod.name = propertyKey;
    var paramTypes = Reflect.getOwnMetadata("design:paramtypes", target, propertyKey);
    while (paramTypes.length > serviceMethod.parameters.length) {
        serviceMethod.parameters.push(new metadata.MethodParam(null, paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
    }
    serviceMethod.parameters.forEach(function (param) {
        if (param.paramType == metadata.ParamType.cookie) {
            serviceMethod.mustParseCookies = true;
        }
        else if (param.paramType == metadata.ParamType.file) {
            serviceMethod.files.push(new metadata.FileParam(param.name, true));
        }
        else if (param.paramType == metadata.ParamType.files) {
            serviceMethod.files.push(new metadata.FileParam(param.name, false));
        }
        else if (param.paramType == metadata.ParamType.param) {
            serviceMethod.acceptMultiTypedParam = true;
        }
        else if (param.paramType == metadata.ParamType.form) {
            if (serviceMethod.mustParseBody) {
                throw Error("Can not use form parameters with a body parameter on the same method.");
            }
            serviceMethod.mustParseForms = true;
        }
        else if (param.paramType == metadata.ParamType.body) {
            if (serviceMethod.mustParseForms) {
                throw Error("Can not use form parameters with a body parameter on the same method.");
            }
            if (serviceMethod.mustParseBody) {
                throw Error("Can not use more than one body parameter on the same method.");
            }
            serviceMethod.mustParseBody = true;
        }
    });
}

//# sourceMappingURL=decorators.js.map
