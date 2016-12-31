"use strict";
var ServiceClass = (function () {
    function ServiceClass(targetClass) {
        this.targetClass = targetClass;
        this.methods = new Map();
    }
    ServiceClass.prototype.addProperty = function (key, paramType) {
        if (!this.hasProperties()) {
            this.properties = new Map();
        }
        this.properties.set(key, paramType);
    };
    ServiceClass.prototype.hasProperties = function () {
        return (this.properties && this.properties.size > 0);
    };
    return ServiceClass;
}());
exports.ServiceClass = ServiceClass;
var ServiceMethod = (function () {
    function ServiceMethod() {
        this.parameters = new Array();
        this.mustParseCookies = false;
        this.files = new Array();
        this.mustParseBody = false;
        this.mustParseForms = false;
        this.acceptMultiTypedParam = false;
    }
    return ServiceMethod;
}());
exports.ServiceMethod = ServiceMethod;
var FileParam = (function () {
    function FileParam(name, singleFile) {
        this.name = name;
        this.singleFile = singleFile;
    }
    return FileParam;
}());
exports.FileParam = FileParam;
var MethodParam = (function () {
    function MethodParam(name, type, paramType) {
        this.name = name;
        this.type = type;
        this.paramType = paramType;
    }
    return MethodParam;
}());
exports.MethodParam = MethodParam;
var ParamType;
(function (ParamType) {
    ParamType[ParamType["path"] = 0] = "path";
    ParamType[ParamType["query"] = 1] = "query";
    ParamType[ParamType["header"] = 2] = "header";
    ParamType[ParamType["cookie"] = 3] = "cookie";
    ParamType[ParamType["form"] = 4] = "form";
    ParamType[ParamType["body"] = 5] = "body";
    ParamType[ParamType["param"] = 6] = "param";
    ParamType[ParamType["file"] = 7] = "file";
    ParamType[ParamType["files"] = 8] = "files";
    ParamType[ParamType["context"] = 9] = "context";
    ParamType[ParamType["context_request"] = 10] = "context_request";
    ParamType[ParamType["context_response"] = 11] = "context_response";
    ParamType[ParamType["context_next"] = 12] = "context_next";
    ParamType[ParamType["context_accept"] = 13] = "context_accept";
    ParamType[ParamType["context_accept_language"] = 14] = "context_accept_language";
})(ParamType = exports.ParamType || (exports.ParamType = {}));

//# sourceMappingURL=metadata.js.map
