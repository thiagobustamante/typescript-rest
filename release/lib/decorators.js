"use strict";

var _getMetadata = require("babel-runtime/core-js/reflect/get-metadata");

var _getMetadata2 = _interopRequireDefault(_getMetadata);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server_container_1 = require("./server-container");
var server_types_1 = require("./server-types");
var metadata = require("./metadata");
require("reflect-metadata");
function Path(path) {
    return function () {
        if (arguments.length == 1) {
            return PathTypeDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], path]);
        } else if (arguments.length == 3 && (0, _typeof3.default)(arguments.length <= 2 ? undefined : arguments[2]) === "object") {
            return PathMethodDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2], path]);
        }
        throw new Error("Invalid @Path Decorator declaration.");
    };
}
exports.Path = Path;
function AcceptLanguage() {
    for (var _len = arguments.length, languages = Array(_len), _key = 0; _key < _len; _key++) {
        languages[_key] = arguments[_key];
    }

    return function () {
        if (arguments.length == 1) {
            return AcceptLanguageTypeDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], languages]);
        } else if (arguments.length == 3 && (0, _typeof3.default)(arguments.length <= 2 ? undefined : arguments[2]) === "object") {
            return AcceptLanguageMethodDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2], languages]);
        }
        throw new Error("Invalid @AcceptLanguage Decorator declaration.");
    };
}
exports.AcceptLanguage = AcceptLanguage;
function Accept() {
    for (var _len2 = arguments.length, accepts = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        accepts[_key2] = arguments[_key2];
    }

    return function () {
        if (arguments.length == 1) {
            return AcceptTypeDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], accepts]);
        } else if (arguments.length == 3 && (0, _typeof3.default)(arguments.length <= 2 ? undefined : arguments[2]) === "object") {
            return AcceptMethodDecorator.apply(this, [arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2], accepts]);
        }
        throw new Error("Invalid @Accept Decorator declaration.");
    };
}
exports.Accept = Accept;
function Context() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs = args.concat([metadata.ParamType.context, null]);
        return processDecoratedParameter.apply(this, _newArgs);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.Context = Context;
function ContextRequest() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_request]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs2 = args.concat([metadata.ParamType.context_request, null]);
        return processDecoratedParameter.apply(this, _newArgs2);
    }
    throw new Error("Invalid @ContextRequest Decorator declaration.");
}
exports.ContextRequest = ContextRequest;
function ContextResponse() {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_response]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs3 = args.concat([metadata.ParamType.context_response, null]);
        return processDecoratedParameter.apply(this, _newArgs3);
    }
    throw new Error("Invalid @ContextResponse Decorator declaration.");
}
exports.ContextResponse = ContextResponse;
function ContextNext() {
    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_next]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs4 = args.concat([metadata.ParamType.context_next, null]);
        return processDecoratedParameter.apply(this, _newArgs4);
    }
    throw new Error("Invalid @ContextNext Decorator declaration.");
}
exports.ContextNext = ContextNext;
function ContextLanguage() {
    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_accept_language]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs5 = args.concat([metadata.ParamType.context_accept_language, null]);
        return processDecoratedParameter.apply(this, _newArgs5);
    }
    throw new Error("Invalid @ContextLanguage Decorator declaration.");
}
exports.ContextLanguage = ContextLanguage;
function ContextAccept() {
    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
    }

    if (args.length == 2) {
        var newArgs = args.concat([metadata.ParamType.context_accept]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs6 = args.concat([metadata.ParamType.context_accept, null]);
        return processDecoratedParameter.apply(this, _newArgs6);
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
function AcceptLanguageTypeDecorator(target, languages) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.languages = languages;
}
function AcceptLanguageMethodDecorator(target, propertyKey, descriptor, languages) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        serviceMethod.languages = languages;
    }
}
function AcceptTypeDecorator(target, accepts) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.accepts = accepts;
}
function AcceptMethodDecorator(target, propertyKey, descriptor, accepts) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        serviceMethod.accepts = accepts;
    }
}
function PathTypeDecorator(target, path) {
    var classData = server_container_1.InternalServer.registerServiceClass(target);
    classData.path = path;
}
function PathMethodDecorator(target, propertyKey, descriptor, path) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        serviceMethod.path = path;
    }
}
function processDecoratedParameter(target, propertyKey, parameterIndex, paramType, name) {
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        var paramTypes = (0, _getMetadata2.default)("design:paramtypes", target, propertyKey);
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
    var serviceMethod = server_container_1.InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        if (serviceMethod.httpMethod) {
            throw new Error("Method is already annotated with @" + serviceMethod.httpMethod + ". You can only map a method to one HTTP verb.");
        }
        serviceMethod.httpMethod = httpMethod;
        processServiceMethod(target, propertyKey, serviceMethod);
    }
}
function processServiceMethod(target, propertyKey, serviceMethod) {
    serviceMethod.name = propertyKey;
    serviceMethod.returnType = (0, _getMetadata2.default)("design:returntype", target, propertyKey);
    var paramTypes = (0, _getMetadata2.default)("design:paramtypes", target, propertyKey);
    while (paramTypes.length > serviceMethod.parameters.length) {
        serviceMethod.parameters.push(new metadata.MethodParam(null, paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
    }
    serviceMethod.parameters.forEach(function (param) {
        if (param.paramType == metadata.ParamType.cookie) {
            serviceMethod.mustParseCookies = true;
        } else if (param.paramType == metadata.ParamType.file) {
            serviceMethod.files.push(new metadata.FileParam(param.name, true));
        } else if (param.paramType == metadata.ParamType.files) {
            serviceMethod.files.push(new metadata.FileParam(param.name, false));
        } else if (param.paramType == metadata.ParamType.form) {
            if (serviceMethod.mustParseBody) {
                throw Error("Can not use form parameters with a body parameter on the same method.");
            }
            serviceMethod.mustParseForms = true;
        } else if (param.paramType == metadata.ParamType.body) {
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
