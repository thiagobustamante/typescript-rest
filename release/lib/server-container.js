"use strict";
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var multer = require("multer");
var metadata = require("./metadata");
var Errors = require("./server-errors");
var StringUtils = require("underscore.string");
var es5_compat_1 = require("./es5-compat");
var server_types_1 = require("./server-types");
var InternalServer = (function () {
    function InternalServer(router) {
        this.router = router;
    }
    InternalServer.registerServiceClass = function (target) {
        InternalServer.pathsResolved = false;
        var name = target['name'] || target.constructor['name'];
        if (!InternalServer.serverClasses.has(name)) {
            InternalServer.serverClasses.set(name, new metadata.ServiceClass(target));
        }
        var serviceClass = InternalServer.serverClasses.get(name);
        return serviceClass;
    };
    InternalServer.registerServiceMethod = function (target, methodName) {
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
    };
    InternalServer.prototype.buildServices = function (types) {
        var _this = this;
        InternalServer.serverClasses.forEach(function (classData) {
            classData.methods.forEach(function (method) {
                if (_this.validateTargetType(classData.targetClass, types)) {
                    _this.buildService(classData, method);
                }
            });
        });
        InternalServer.pathsResolved = true;
        this.handleNotAllowedMethods();
    };
    InternalServer.prototype.buildService = function (serviceClass, serviceMethod) {
        var _this = this;
        var handler = function (req, res, next) {
            _this.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
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
    };
    InternalServer.prototype.validateTargetType = function (targetClass, types) {
        if (types && types.length > 0) {
            return (types.indexOf(targetClass) > -1);
        }
        return true;
    };
    InternalServer.prototype.handleNotAllowedMethods = function () {
        var _this = this;
        var paths = InternalServer.getPaths();
        paths.forEach(function (path) {
            var supported = InternalServer.getHttpMethods(path);
            var allowedMethods = new Array();
            supported.forEach(function (method) {
                allowedMethods.push(server_types_1.HttpMethod[method]);
            });
            var allowed = allowedMethods.join(', ');
            _this.router.all(path, function (req, res, next) {
                res.set('Allow', allowed);
                throw new Errors.MethodNotAllowedError();
            });
        });
    };
    InternalServer.prototype.getUploader = function () {
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
            }
            else {
                this.upload = multer();
            }
        }
        return this.upload;
    };
    InternalServer.prototype.buildServiceMiddleware = function (serviceMethod) {
        var result = new Array();
        if (serviceMethod.mustParseCookies || serviceMethod.acceptMultiTypedParam) {
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
        if (serviceMethod.mustParseForms || serviceMethod.acceptMultiTypedParam) {
            result.push(bodyParser.urlencoded({ extended: true }));
        }
        if (serviceMethod.files.length > 0) {
            var options_1 = new Array();
            serviceMethod.files.forEach(function (fileData) {
                if (fileData.singleFile) {
                    options_1.push({ "name": fileData.name, "maxCount": 1 });
                }
                else {
                    options_1.push({ "name": fileData.name });
                }
            });
            result.push(this.getUploader().fields(options_1));
        }
        return result;
    };
    InternalServer.prototype.processResponseHeaders = function (serviceMethod, context) {
        if (serviceMethod.resolvedLanguages) {
            if (serviceMethod.httpMethod === server_types_1.HttpMethod.GET) {
                context.response.vary("Accept-Language");
            }
            context.response.set("Content-Language", context.language);
        }
        if (serviceMethod.resolvedAccepts) {
            context.response.vary("Accept");
        }
    };
    InternalServer.prototype.checkAcceptance = function (serviceMethod, context) {
        if (serviceMethod.resolvedLanguages) {
            var lang = context.request.acceptsLanguages(serviceMethod.resolvedLanguages);
            if (lang) {
                context.language = lang;
            }
        }
        else {
            var languages = context.request.acceptsLanguages();
            if (languages && languages.length > 0) {
                context.language = languages[0];
            }
        }
        if (serviceMethod.resolvedAccepts) {
            var accept = context.request.accepts(serviceMethod.resolvedAccepts);
            if (accept) {
                context.accept = accept;
            }
            else {
                throw new Errors.NotAcceptableError("Accept");
            }
        }
        if (!context.language) {
            throw new Errors.NotAcceptableError("Accept-Language");
        }
    };
    InternalServer.prototype.createService = function (serviceClass, context) {
        var serviceObject = Object.create(serviceClass.targetClass);
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
                        serviceObject[key] = context.accept;
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
    };
    InternalServer.prototype.callTargetEndPoint = function (serviceClass, serviceMethod, req, res, next) {
        var context = new server_types_1.ServiceContext();
        context.request = req;
        context.response = res;
        context.next = next;
        this.checkAcceptance(serviceMethod, context);
        var serviceObject = this.createService(serviceClass, context);
        var args = this.buildArgumentsList(serviceMethod, context);
        var toCall = serviceClass.targetClass.prototype[serviceMethod.name] || serviceClass.targetClass[serviceMethod.name];
        var result = toCall.apply(serviceObject, args);
        this.processResponseHeaders(serviceMethod, context);
        this.sendValue(result, res, next);
    };
    InternalServer.prototype.sendValue = function (value, res, next) {
        switch (typeof value) {
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
                if (value.location && value instanceof server_types_1.ReferencedResource) {
                    res.set("Location", value.location);
                    res.sendStatus(value.statusCode);
                }
                else if (value.then && value.constructor['name'] === 'Promise') {
                    var self_1 = this;
                    value.then(function (val) {
                        self_1.sendValue(val, res, next);
                    }).catch(function (err) {
                        next(err);
                    });
                }
                else {
                    res.json(value);
                }
        }
    };
    InternalServer.prototype.buildArgumentsList = function (serviceMethod, context) {
        var _this = this;
        var result = new Array();
        serviceMethod.parameters.forEach(function (param) {
            switch (param.paramType) {
                case metadata.ParamType.path:
                    result.push(_this.convertType(context.request.params[param.name], param.type));
                    break;
                case metadata.ParamType.query:
                    result.push(_this.convertType(context.request.query[param.name], param.type));
                    break;
                case metadata.ParamType.header:
                    result.push(_this.convertType(context.request.header(param.name), param.type));
                    break;
                case metadata.ParamType.cookie:
                    result.push(_this.convertType(context.request.cookies[param.name], param.type));
                    break;
                case metadata.ParamType.body:
                    result.push(_this.convertType(context.request.body, param.type));
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
                    result.push(_this.convertType(context.request.body[param.name], param.type));
                    break;
                case metadata.ParamType.param:
                    var paramValue = context.request.body[param.name] ||
                        context.request.query[param.name] ||
                        context.request.cookies[param.name] ||
                        context.request.header(param.name) ||
                        context.request.params[param.name];
                    result.push(_this.convertType(paramValue, param.type));
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
                    result.push(context.accept);
                    break;
                case metadata.ParamType.context_accept_language:
                    result.push(context.language);
                    break;
                default:
                    throw Error("Invalid parameter type");
            }
        });
        return result;
    };
    InternalServer.prototype.convertType = function (paramValue, paramType) {
        var serializedType = paramType['name'];
        switch (serializedType) {
            case "Number":
                return paramValue ? parseFloat(paramValue) : 0;
            case "Boolean":
                return paramValue === 'true';
            default:
                return paramValue;
        }
    };
    InternalServer.resolveAllPaths = function () {
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
    };
    InternalServer.getPaths = function () {
        InternalServer.resolveAllPaths();
        return new es5_compat_1.Set(InternalServer.paths.keys());
    };
    InternalServer.getHttpMethods = function (path) {
        InternalServer.resolveAllPaths();
        var methods = InternalServer.paths.get(path);
        return methods || new es5_compat_1.Set();
    };
    InternalServer.resolveLanguages = function (serviceClass, serviceMethod) {
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
    };
    InternalServer.resolveAccepts = function (serviceClass, serviceMethod) {
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
    };
    InternalServer.resolveProperties = function (serviceClass, serviceMethod) {
        InternalServer.resolveLanguages(serviceClass, serviceMethod);
        InternalServer.resolveAccepts(serviceClass, serviceMethod);
        InternalServer.resolvePath(serviceClass, serviceMethod);
    };
    InternalServer.resolvePath = function (serviceClass, serviceMethod) {
        var classPath = serviceClass.path ? serviceClass.path.trim() : "";
        var resolvedPath = StringUtils.startsWith(classPath, '/') ? classPath : '/' + classPath;
        if (StringUtils.endsWith(resolvedPath, '/')) {
            resolvedPath = resolvedPath.slice(0, resolvedPath.length - 1);
        }
        if (serviceMethod.path) {
            var methodPath = serviceMethod.path.trim();
            resolvedPath = resolvedPath + (StringUtils.startsWith(methodPath, '/') ? methodPath : '/' + methodPath);
        }
        var declaredHttpMethods = InternalServer.paths.get(resolvedPath);
        if (!declaredHttpMethods) {
            declaredHttpMethods = new es5_compat_1.Set();
            InternalServer.paths.set(resolvedPath, declaredHttpMethods);
        }
        if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
            throw Error("Duplicated declaration for path [" + resolvedPath + "], method ["
                + serviceMethod.httpMethod + "]. ");
        }
        declaredHttpMethods.add(serviceMethod.httpMethod);
        serviceMethod.resolvedPath = resolvedPath;
    };
    InternalServer.serverClasses = new es5_compat_1.StringMap();
    InternalServer.paths = new es5_compat_1.StringMap();
    InternalServer.pathsResolved = false;
    return InternalServer;
}());
exports.InternalServer = InternalServer;

//# sourceMappingURL=server-container.js.map
