"use strict";

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getMetadata = require("babel-runtime/core-js/reflect/get-metadata");

var _getMetadata2 = _interopRequireDefault(_getMetadata);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
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
        throw new Error("Invalid @Accept Decorator declaration.");
    };
}
exports.AcceptLanguage = AcceptLanguage;
function Context() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    if (args.length == 2) {
        var newArgs = args.concat([ParamType.context]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs = args.concat([ParamType.context, null]);
        return processDecoratedParameter.apply(this, _newArgs);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.Context = Context;
function ContextRequest() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    if (args.length == 2) {
        var newArgs = args.concat([ParamType.context_request]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs2 = args.concat([ParamType.context_request, null]);
        return processDecoratedParameter.apply(this, _newArgs2);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.ContextRequest = ContextRequest;
function ContextResponse() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    if (args.length == 2) {
        var newArgs = args.concat([ParamType.context_response]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs3 = args.concat([ParamType.context_response, null]);
        return processDecoratedParameter.apply(this, _newArgs3);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.ContextResponse = ContextResponse;
function ContextNext() {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
    }

    if (args.length == 2) {
        var newArgs = args.concat([ParamType.context_next]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs4 = args.concat([ParamType.context_next, null]);
        return processDecoratedParameter.apply(this, _newArgs4);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.ContextNext = ContextNext;
function ContextLanguage() {
    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
    }

    if (args.length == 2) {
        var newArgs = args.concat([ParamType.context_accept_language]);
        return processDecoratedProperty.apply(this, newArgs);
    } else if (args.length == 3 && typeof args[2] === "number") {
        var _newArgs5 = args.concat([ParamType.context_accept_language, null]);
        return processDecoratedParameter.apply(this, _newArgs5);
    }
    throw new Error("Invalid @Context Decorator declaration.");
}
exports.ContextLanguage = ContextLanguage;
function GET(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.GET);
}
exports.GET = GET;
function POST(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.POST);
}
exports.POST = POST;
function PUT(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PUT);
}
exports.PUT = PUT;
function DELETE(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.DELETE);
}
exports.DELETE = DELETE;
function HEAD(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.HEAD);
}
exports.HEAD = HEAD;
function OPTIONS(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.OPTIONS);
}
exports.OPTIONS = OPTIONS;
function PATCH(target, propertyKey, descriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PATCH);
}
exports.PATCH = PATCH;
function PathParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.path, name);
    };
}
exports.PathParam = PathParam;
function QueryParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.query, name);
    };
}
exports.QueryParam = QueryParam;
function HeaderParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.header, name);
    };
}
exports.HeaderParam = HeaderParam;
function CookieParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.cookie, name);
    };
}
exports.CookieParam = CookieParam;
function FormParam(name) {
    return function (target, propertyKey, parameterIndex) {
        processDecoratedParameter(target, propertyKey, parameterIndex, ParamType.form, name);
    };
}
exports.FormParam = FormParam;

var ServiceContext = function ServiceContext() {
    (0, _classCallCheck3.default)(this, ServiceContext);
};

exports.ServiceContext = ServiceContext;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["HEAD"] = 4] = "HEAD";
    HttpMethod[HttpMethod["OPTIONS"] = 5] = "OPTIONS";
    HttpMethod[HttpMethod["PATCH"] = 6] = "PATCH";
})(exports.HttpMethod || (exports.HttpMethod = {}));
var HttpMethod = exports.HttpMethod;

var Server = function () {
    function Server() {
        (0, _classCallCheck3.default)(this, Server);
    }

    (0, _createClass3.default)(Server, null, [{
        key: "buildServices",
        value: function buildServices(router) {
            var iternalServer = new InternalServer(router);
            iternalServer.buildServices();
        }
    }, {
        key: "getPaths",
        value: function getPaths() {
            return InternalServer.getPaths();
        }
    }, {
        key: "getHttpMethods",
        value: function getHttpMethods(path) {
            return InternalServer.getHttpMethods(path);
        }
    }, {
        key: "setCookiesSecret",
        value: function setCookiesSecret(secret) {
            InternalServer.cookiesSecret = secret;
        }
    }, {
        key: "setCookiesDecoder",
        value: function setCookiesDecoder(decoder) {
            InternalServer.cookiesDecoder = decoder;
        }
    }]);
    return Server;
}();

exports.Server = Server;
function AcceptLanguageTypeDecorator(target, languages) {
    var classData = InternalServer.registerServiceClass(target);
    classData.languages = languages;
}
function AcceptLanguageMethodDecorator(target, propertyKey, descriptor, languages) {
    var serviceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        serviceMethod.languages = languages;
    }
}
function PathTypeDecorator(target, path) {
    var classData = InternalServer.registerServiceClass(target);
    classData.path = path;
}
function PathMethodDecorator(target, propertyKey, descriptor, path) {
    var serviceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) {
        serviceMethod.path = path;
    }
}
function processDecoratedParameter(target, propertyKey, parameterIndex, paramType, name) {
    var serviceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        var paramTypes = (0, _getMetadata2.default)("design:paramtypes", target, propertyKey);
        while (serviceMethod.parameters.length < paramTypes.length) {
            serviceMethod.parameters.push(new MethodParam(null, paramTypes[serviceMethod.parameters.length], ParamType.body));
        }
        serviceMethod.parameters[parameterIndex] = new MethodParam(name, paramTypes[parameterIndex], paramType);
    }
}
function processDecoratedProperty(target, key, paramType) {
    var classData = InternalServer.registerServiceClass(target.constructor);
    classData.addProperty(key, paramType);
}
function processHttpVerb(target, propertyKey, httpMethod) {
    var serviceMethod = InternalServer.registerServiceMethod(target, propertyKey);
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
        serviceMethod.parameters.push(new MethodParam(null, paramTypes[serviceMethod.parameters.length], ParamType.body));
    }
    serviceMethod.parameters.forEach(function (param) {
        if (param.paramType == ParamType.cookie) {
            serviceMethod.mustParseCookies = true;
        } else if (param.paramType == ParamType.form) {
            if (serviceMethod.mustParseBody) {
                throw Error("Can not use form parameters with a body parameter on the same method.");
            }
            serviceMethod.mustParseForms = true;
        } else if (param.paramType == ParamType.body) {
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

var ServiceClass = function () {
    function ServiceClass(targetClass) {
        (0, _classCallCheck3.default)(this, ServiceClass);

        this.targetClass = targetClass;
        this.methods = new _map2.default();
    }

    (0, _createClass3.default)(ServiceClass, [{
        key: "addProperty",
        value: function addProperty(key, paramType) {
            if (!this.hasProperties()) {
                this.properties = new _map2.default();
            }
            this.properties.set(key, paramType);
        }
    }, {
        key: "hasProperties",
        value: function hasProperties() {
            return this.properties && this.properties.size > 0;
        }
    }]);
    return ServiceClass;
}();

var ServiceMethod = function ServiceMethod() {
    (0, _classCallCheck3.default)(this, ServiceMethod);

    this.parameters = new Array();
    this.mustParseCookies = false;
    this.mustParseBody = false;
    this.mustParseForms = false;
};

var MethodParam = function MethodParam(name, type, paramType) {
    (0, _classCallCheck3.default)(this, MethodParam);

    this.name = name;
    this.type = type;
    this.paramType = paramType;
};

var ParamType;
(function (ParamType) {
    ParamType[ParamType["path"] = 0] = "path";
    ParamType[ParamType["query"] = 1] = "query";
    ParamType[ParamType["header"] = 2] = "header";
    ParamType[ParamType["cookie"] = 3] = "cookie";
    ParamType[ParamType["form"] = 4] = "form";
    ParamType[ParamType["body"] = 5] = "body";
    ParamType[ParamType["context"] = 6] = "context";
    ParamType[ParamType["context_request"] = 7] = "context_request";
    ParamType[ParamType["context_response"] = 8] = "context_response";
    ParamType[ParamType["context_next"] = 9] = "context_next";
    ParamType[ParamType["context_accept_language"] = 10] = "context_accept_language";
})(ParamType || (ParamType = {}));

var InternalServer = function () {
    function InternalServer(router) {
        (0, _classCallCheck3.default)(this, InternalServer);

        this.router = router;
    }

    (0, _createClass3.default)(InternalServer, [{
        key: "buildServices",
        value: function buildServices() {
            var _this = this;

            InternalServer.serverClasses.forEach(function (classData) {
                classData.methods.forEach(function (method) {
                    _this.buildService(classData, method);
                });
            });
            InternalServer.pathsResolved = true;
        }
    }, {
        key: "buildService",
        value: function buildService(serviceClass, serviceMethod) {
            var _this2 = this;

            var handler = function handler(req, res, next) {
                _this2.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
            };
            if (!serviceMethod.resolvedPath) {
                InternalServer.resolveProperties(serviceClass, serviceMethod);
            }
            var middleware = this.buildServiceMiddleware(serviceMethod);
            var args = [serviceMethod.resolvedPath];
            args = args.concat(middleware);
            args.push(handler);
            switch (serviceMethod.httpMethod) {
                case HttpMethod.GET:
                    this.router.get.apply(this.router, args);
                    break;
                case HttpMethod.POST:
                    this.router.post.apply(this.router, args);
                    break;
                case HttpMethod.PUT:
                    this.router.put.apply(this.router, args);
                    break;
                case HttpMethod.DELETE:
                    this.router.delete.apply(this.router, args);
                    break;
                case HttpMethod.HEAD:
                    this.router.head.apply(this.router, args);
                    break;
                case HttpMethod.OPTIONS:
                    this.router.options.apply(this.router, args);
                    break;
                case HttpMethod.PATCH:
                    this.router.patch.apply(this.router, args);
                    break;
                default:
                    throw Error("Invalid http method for service [" + serviceMethod.resolvedPath + "]");
            }
        }
    }, {
        key: "buildServiceMiddleware",
        value: function buildServiceMiddleware(serviceMethod) {
            var result = new Array();
            if (serviceMethod.mustParseCookies) {
                var args = [];
                if (InternalServer.cookiesSecret) {
                    args.push(InternalServer.cookiesSecret);
                }
                if (InternalServer.cookiesDecoder) {
                    args.push({ decode: InternalServer.cookiesDecoder });
                }
                result.push(cookieParser.apply(this, args));
            }
            if (serviceMethod.mustParseBody) {
                result.push(bodyParser.json());
            }
            if (serviceMethod.mustParseForms) {
                result.push(bodyParser.urlencoded({ extended: true }));
            }
            return result;
        }
    }, {
        key: "processResponseHeaders",
        value: function processResponseHeaders(serviceMethod, context) {
            if (serviceMethod.resolvedLanguages) {
                if (serviceMethod.httpMethod === HttpMethod.GET) {
                    context.response.vary("Accept-Language");
                }
                context.response.set("Content-Language", context.language);
            }
        }
    }, {
        key: "acceptable",
        value: function acceptable(serviceMethod, context) {
            if (serviceMethod.resolvedLanguages) {
                var lang = context.request.acceptsLanguages(serviceMethod.resolvedLanguages);
                if (lang) {
                    context.language = lang;
                }
            } else {
                var languages = context.request.acceptsLanguages();
                if (languages && languages.length > 0) {
                    context.language = languages[0];
                }
            }
            if (!context.language) {
                return false;
            }
            return true;
        }
    }, {
        key: "createService",
        value: function createService(serviceClass, context) {
            var serviceObject = (0, _create2.default)(serviceClass.targetClass);
            if (serviceClass.hasProperties()) {
                serviceClass.properties.forEach(function (paramType, key) {
                    switch (paramType) {
                        case ParamType.context:
                            serviceObject[key] = context;
                            break;
                        case ParamType.context_accept_language:
                            serviceObject[key] = context.language;
                            break;
                        case ParamType.context_request:
                            serviceObject[key] = context.request;
                            break;
                        case ParamType.context_response:
                            serviceObject[key] = context.response;
                            break;
                        case ParamType.context_next:
                            serviceObject[key] = context.next;
                            break;
                        default:
                            break;
                    }
                });
            }
            return serviceObject;
        }
    }, {
        key: "callTargetEndPoint",
        value: function callTargetEndPoint(serviceClass, serviceMethod, req, res, next) {
            var context = new ServiceContext();
            context.request = req;
            context.response = res;
            context.next = next;
            if (this.acceptable(serviceMethod, context)) {
                var serviceObject = this.createService(serviceClass, context);
                var args = this.buildArgumentsList(serviceMethod, context);
                var result = serviceClass.targetClass.prototype[serviceMethod.name].apply(serviceObject, args);
                this.processResponseHeaders(serviceMethod, context);
                if (serviceMethod.returnType) {
                    var serializedType = serviceMethod.returnType.name;
                    switch (serializedType) {
                        case "String":
                            res.send(result);
                            break;
                        case "Number":
                            res.send(result.toString());
                            break;
                        case "Boolean":
                            res.send(result.toString());
                            break;
                        case "Promise":
                            var self = this;
                            result.then(function (value) {
                                self.sendValue(value, res);
                            }).catch(function (e) {
                                if (!res.headersSent) {
                                    res.sendStatus(500);
                                }
                            });
                            break;
                        case "undefined":
                            res.sendStatus(204);
                            break;
                        default:
                            res.json(result);
                            break;
                    }
                } else {
                    this.sendValue(result, res);
                }
            } else {
                res.sendStatus(406);
            }
        }
    }, {
        key: "sendValue",
        value: function sendValue(value, res) {
            var _this3 = this;

            switch (typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) {
                case "number":
                    res.send(value.toString());
                    break;
                case "string":
                    res.send(value);
                    break;
                case "boolean":
                    res.send(value.toString());
                    break;
                case "undefined":
                    if (!res.headersSent) {
                        res.sendStatus(204);
                    }
                    break;
                default:
                    if (value.constructor.name == "Promise") {
                        (function () {
                            var self = _this3;
                            value.then(function (val) {
                                self.sendValue(val, res);
                            }).catch(function (e) {
                                if (!res.headersSent) {
                                    res.sendStatus(500);
                                }
                            });
                        })();
                    } else {
                        res.json(value);
                    }
            }
        }
    }, {
        key: "buildArgumentsList",
        value: function buildArgumentsList(serviceMethod, context) {
            var _this4 = this;

            var result = new Array();
            serviceMethod.parameters.forEach(function (param) {
                switch (param.paramType) {
                    case ParamType.path:
                        result.push(_this4.convertType(context.request.params[param.name], param.type));
                        break;
                    case ParamType.query:
                        result.push(_this4.convertType(context.request.query[param.name], param.type));
                        break;
                    case ParamType.header:
                        result.push(_this4.convertType(context.request.header(param.name), param.type));
                        break;
                    case ParamType.cookie:
                        result.push(_this4.convertType(context.request.cookies[param.name], param.type));
                        break;
                    case ParamType.body:
                        result.push(_this4.convertType(context.request.body, param.type));
                        break;
                    case ParamType.form:
                        result.push(_this4.convertType(context.request.body[param.name], param.type));
                        break;
                    case ParamType.context:
                        result.push(context);
                        break;
                    case ParamType.context_request:
                        result.push(context.request);
                        break;
                    case ParamType.context_response:
                        result.push(context.response);
                        break;
                    case ParamType.context_next:
                        result.push(context.next);
                        break;
                    case ParamType.context_accept_language:
                        result.push(context.language);
                        break;
                    default:
                        throw Error("Invalid parameter type");
                }
            });
            return result;
        }
    }, {
        key: "convertType",
        value: function convertType(paramValue, paramType) {
            var serializedType = paramType.name;
            switch (serializedType) {
                case "Number":
                    return paramValue ? parseFloat(paramValue) : 0;
                case "Boolean":
                    return paramValue === 'true';
                default:
                    return paramValue;
            }
        }
    }], [{
        key: "registerServiceClass",
        value: function registerServiceClass(target) {
            InternalServer.pathsResolved = false;
            var name = target.name || target.constructor.name;
            if (!InternalServer.serverClasses.has(name)) {
                InternalServer.serverClasses.set(name, new ServiceClass(target));
            }
            var serviceClass = InternalServer.serverClasses.get(name);
            return serviceClass;
        }
    }, {
        key: "registerServiceMethod",
        value: function registerServiceMethod(target, methodName) {
            if (methodName) {
                InternalServer.pathsResolved = false;
                var classData = InternalServer.registerServiceClass(target);
                if (!classData.methods.has(methodName)) {
                    classData.methods.set(methodName, new ServiceMethod());
                }
                var serviceMethod = classData.methods.get(methodName);
                return serviceMethod;
            }
            return null;
        }
    }, {
        key: "resolveAllPaths",
        value: function resolveAllPaths() {
            if (!InternalServer.pathsResolved) {
                InternalServer.paths.clear();
                InternalServer.serverClasses.forEach(function (classData) {
                    classData.methods.forEach(function (method) {
                        if (!method.resolvedPath) {
                            InternalServer.resolveProperties(classData, method);
                        }
                    });
                });
                InternalServer.pathsResolved = true;
            }
        }
    }, {
        key: "getPaths",
        value: function getPaths() {
            InternalServer.resolveAllPaths();
            return new _set2.default(InternalServer.paths.keys());
        }
    }, {
        key: "getHttpMethods",
        value: function getHttpMethods(path) {
            InternalServer.resolveAllPaths();
            var methods = InternalServer.paths.get(path);
            return methods || new _set2.default();
        }
    }, {
        key: "resolveLanguages",
        value: function resolveLanguages(serviceClass, serviceMethod) {
            var resolvedLanguages = new Array();
            if (serviceClass.languages) {
                serviceClass.languages.forEach(function (lang) {
                    resolvedLanguages.push(lang);
                });
            }
            if (serviceMethod.languages) {
                serviceMethod.languages.forEach(function (lang) {
                    resolvedLanguages.push(lang);
                });
            }
            if (resolvedLanguages.length > 0) {
                serviceMethod.resolvedLanguages = resolvedLanguages;
            }
        }
    }, {
        key: "resolveProperties",
        value: function resolveProperties(serviceClass, serviceMethod) {
            InternalServer.resolveLanguages(serviceClass, serviceMethod);
            InternalServer.resolvePath(serviceClass, serviceMethod);
        }
    }, {
        key: "resolvePath",
        value: function resolvePath(serviceClass, serviceMethod) {
            var classPath = serviceClass.path ? serviceClass.path.trim() : "";
            var resolvedPath = classPath.startsWith('/') ? classPath : '/' + classPath;
            if (resolvedPath.endsWith('/')) {
                resolvedPath = resolvedPath.slice(0, resolvedPath.length - 1);
            }
            if (serviceMethod.path) {
                var methodPath = serviceMethod.path.trim();
                resolvedPath = classPath + (methodPath.startsWith('/') ? methodPath : '/' + methodPath);
            }
            var declaredHttpMethods = InternalServer.paths.get(resolvedPath);
            if (!declaredHttpMethods) {
                declaredHttpMethods = new _set2.default();
                InternalServer.paths.set(resolvedPath, declaredHttpMethods);
            }
            if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
                throw Error("Duplicated declaration for path [" + resolvedPath + "], method [" + serviceMethod.httpMethod + "]. ");
            }
            declaredHttpMethods.add(serviceMethod.httpMethod);
            serviceMethod.resolvedPath = resolvedPath;
        }
    }]);
    return InternalServer;
}();

InternalServer.serverClasses = new _map2.default();
InternalServer.paths = new _map2.default();
InternalServer.pathsResolved = false;
//# sourceMappingURL=typescript-rest.js.map
