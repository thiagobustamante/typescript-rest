"use strict";

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getMetadata = require("babel-runtime/core-js/reflect/get-metadata");

var _getMetadata2 = _interopRequireDefault(_getMetadata);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

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
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["HEAD"] = 4] = "HEAD";
    HttpMethod[HttpMethod["OPTIONS"] = 5] = "OPTIONS";
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
function processDecoratedParameter(target, propertyKey, parameterIndex, paramtType, name) {
    var serviceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
    if (serviceMethod) {
        var paramTypes = (0, _getMetadata2.default)("design:paramtypes", target, propertyKey);
        while (serviceMethod.parameters.length < paramTypes.length) {
            serviceMethod.parameters.push(new MethodParam(null, paramTypes[serviceMethod.parameters.length], ParamType.body));
        }
        serviceMethod.parameters[parameterIndex] = new MethodParam(name, paramTypes[parameterIndex], paramtType);
    }
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

var ServiceClass = function ServiceClass(targetClass) {
    (0, _classCallCheck3.default)(this, ServiceClass);

    this.targetClass = targetClass;
    this.methods = new _map2.default();
};

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

            var handler = function handler(req, res) {
                _this2.callTargetEndPoint(serviceClass, serviceMethod, req, res);
            };
            if (!serviceMethod.resolvedPath) {
                InternalServer.resolvePath(serviceClass, serviceMethod);
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
        key: "callTargetEndPoint",
        value: function callTargetEndPoint(serviceClass, serviceMethod, req, res) {
            var serviceObject = (0, _create2.default)(serviceClass.targetClass);
            var args = this.buildArgumentsList(serviceMethod, req);
            var result = serviceClass.targetClass.prototype[serviceMethod.name].apply(serviceObject, args);
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
                        result.then(function (value) {
                            switch (typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) {
                                case "number":
                                    res.send(result.toString());
                                    break;
                                case "string":
                                    res.send(result);
                                    break;
                                case "boolean":
                                    res.send(result.toString());
                                    break;
                                default:
                                    res.json(value);
                                    break;
                            }
                        }).catch(function (e) {
                            res.sendStatus(500);
                        });
                        break;
                    case "undefined":
                        res.send("");
                        break;
                    default:
                        res.json(result);
                        break;
                }
            }
        }
    }, {
        key: "buildArgumentsList",
        value: function buildArgumentsList(serviceMethod, req) {
            var _this3 = this;

            var result = new Array();
            serviceMethod.parameters.forEach(function (param) {
                switch (param.paramType) {
                    case ParamType.path:
                        result.push(_this3.convertType(req.params[param.name], param.type));
                        break;
                    case ParamType.query:
                        result.push(_this3.convertType(req.query[param.name], param.type));
                        break;
                    case ParamType.header:
                        result.push(_this3.convertType(req.header(param.name), param.type));
                        break;
                    case ParamType.cookie:
                        result.push(_this3.convertType(req.cookies[param.name], param.type));
                        break;
                    case ParamType.body:
                        result.push(_this3.convertType(req.body, param.type));
                        break;
                    case ParamType.form:
                        result.push(_this3.convertType(req.body[param.name], param.type));
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
                            InternalServer.resolvePath(classData, method);
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
