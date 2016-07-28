"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var multer = require("multer");
var metadata = require("./metadata");
var Errors = require("./server-errors");
var server_types_1 = require("./server-types");

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
                case server_types_1.HttpMethod.GET:
                    this.router.get.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.POST:
                    this.router.post.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.PUT:
                    this.router.put.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.DELETE:
                    this.router.delete.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.HEAD:
                    this.router.head.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.OPTIONS:
                    this.router.options.apply(this.router, args);
                    break;
                case server_types_1.HttpMethod.PATCH:
                    this.router.patch.apply(this.router, args);
                    break;
                default:
                    throw Error("Invalid http method for service [" + serviceMethod.resolvedPath + "]");
            }
        }
    }, {
        key: "getUploader",
        value: function getUploader() {
            if (!this.upload) {
                var options = {};
                if (InternalServer.fileDest) {
                    options.dest = InternalServer.fileDest;
                }
                if (InternalServer.fileFilter) {
                    options.fileFilter = InternalServer.fileFilter;
                }
                if (InternalServer.fileLimits) {
                    options.limits = InternalServer.fileLimits;
                }
                if (options.dest) {
                    this.upload = multer(options);
                } else {
                    this.upload = multer();
                }
            }
            return this.upload;
        }
    }, {
        key: "buildServiceMiddleware",
        value: function buildServiceMiddleware(serviceMethod) {
            var _this3 = this;

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
            if (serviceMethod.files.length > 0) {
                (function () {
                    var options = new Array();
                    serviceMethod.files.forEach(function (fileData) {
                        if (fileData.singleFile) {
                            options.push({ "name": fileData.name, "maxCount": 1 });
                        } else {
                            options.push({ "name": fileData.name });
                        }
                    });
                    result.push(_this3.getUploader().fields(options));
                })();
            }
            return result;
        }
    }, {
        key: "processResponseHeaders",
        value: function processResponseHeaders(serviceMethod, context) {
            if (serviceMethod.resolvedLanguages) {
                if (serviceMethod.httpMethod === server_types_1.HttpMethod.GET) {
                    context.response.vary("Accept-Language");
                }
                context.response.set("Content-Language", context.language);
            }
            if (serviceMethod.resolvedAccepts) {
                context.response.vary("Accept");
            }
        }
    }, {
        key: "checkAcceptance",
        value: function checkAcceptance(serviceMethod, context) {
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
            if (serviceMethod.resolvedAccepts) {
                var accept = context.request.accepts(serviceMethod.resolvedAccepts);
                if (accept) {
                    context.preferredMedia = accept;
                } else {
                    throw new Errors.NotAcceptableError("Accept");
                }
            }
            if (!context.language) {
                throw new Errors.NotAcceptableError("Accept-Language");
            }
        }
    }, {
        key: "createService",
        value: function createService(serviceClass, context) {
            var serviceObject = (0, _create2.default)(serviceClass.targetClass);
            if (serviceClass.hasProperties()) {
                serviceClass.properties.forEach(function (paramType, key) {
                    switch (paramType) {
                        case metadata.ParamType.context:
                            serviceObject[key] = context;
                            break;
                        case metadata.ParamType.context_accept_language:
                            serviceObject[key] = context.language;
                            break;
                        case metadata.ParamType.context_accept:
                            serviceObject[key] = context.preferredMedia;
                            break;
                        case metadata.ParamType.context_request:
                            serviceObject[key] = context.request;
                            break;
                        case metadata.ParamType.context_response:
                            serviceObject[key] = context.response;
                            break;
                        case metadata.ParamType.context_next:
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
            var context = new server_types_1.ServiceContext();
            context.request = req;
            context.response = res;
            context.next = next;
            this.checkAcceptance(serviceMethod, context);
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
        }
    }, {
        key: "sendValue",
        value: function sendValue(value, res) {
            var _this4 = this;

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
                            var self = _this4;
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
            var _this5 = this;

            var result = new Array();
            serviceMethod.parameters.forEach(function (param) {
                switch (param.paramType) {
                    case metadata.ParamType.path:
                        result.push(_this5.convertType(context.request.params[param.name], param.type));
                        break;
                    case metadata.ParamType.query:
                        result.push(_this5.convertType(context.request.query[param.name], param.type));
                        break;
                    case metadata.ParamType.header:
                        result.push(_this5.convertType(context.request.header(param.name), param.type));
                        break;
                    case metadata.ParamType.cookie:
                        result.push(_this5.convertType(context.request.cookies[param.name], param.type));
                        break;
                    case metadata.ParamType.body:
                        result.push(_this5.convertType(context.request.body, param.type));
                        break;
                    case metadata.ParamType.file:
                        var files = context.request.files[param.name];
                        if (files && files.length > 0) {
                            result.push(files[0]);
                        }
                        break;
                    case metadata.ParamType.files:
                        result.push(context.request.files[param.name]);
                        break;
                    case metadata.ParamType.form:
                        result.push(_this5.convertType(context.request.body[param.name], param.type));
                        break;
                    case metadata.ParamType.context:
                        result.push(context);
                        break;
                    case metadata.ParamType.context_request:
                        result.push(context.request);
                        break;
                    case metadata.ParamType.context_response:
                        result.push(context.response);
                        break;
                    case metadata.ParamType.context_next:
                        result.push(context.next);
                        break;
                    case metadata.ParamType.context_accept:
                        result.push(context.preferredMedia);
                        break;
                    case metadata.ParamType.context_accept_language:
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
                InternalServer.serverClasses.set(name, new metadata.ServiceClass(target));
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
                    classData.methods.set(methodName, new metadata.ServiceMethod());
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
        key: "resolveAccepts",
        value: function resolveAccepts(serviceClass, serviceMethod) {
            var resolvedAccepts = new Array();
            if (serviceClass.accepts) {
                serviceClass.accepts.forEach(function (accept) {
                    resolvedAccepts.push(accept);
                });
            }
            if (serviceMethod.accepts) {
                serviceMethod.accepts.forEach(function (accept) {
                    resolvedAccepts.push(accept);
                });
            }
            if (resolvedAccepts.length > 0) {
                serviceMethod.resolvedAccepts = resolvedAccepts;
            }
        }
    }, {
        key: "resolveProperties",
        value: function resolveProperties(serviceClass, serviceMethod) {
            InternalServer.resolveLanguages(serviceClass, serviceMethod);
            InternalServer.resolveAccepts(serviceClass, serviceMethod);
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
exports.InternalServer = InternalServer;
//# sourceMappingURL=server-container.js.map
