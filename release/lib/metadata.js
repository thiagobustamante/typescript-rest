"use strict";
var es5_compat_1 = require("./es5-compat");
var ServiceClass = (function () {
    function ServiceClass(targetClass) {
        this.targetClass = targetClass;
        this.methods = new es5_compat_1.StringMap();
    }
    ServiceClass.prototype.addProperty = function (key, paramType) {
        if (!this.hasProperties()) {
            this.properties = new es5_compat_1.StringMap();
        }
        this.properties.set(key, paramType);
    };
    ServiceClass.prototype.hasProperties = function () {
        return (this.properties && this.properties.size() > 0);
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
(function (ParamType) {
    ParamType[ParamType["path"] = 0] = "path";
    ParamType[ParamType["query"] = 1] = "query";
    ParamType[ParamType["header"] = 2] = "header";
    ParamType[ParamType["cookie"] = 3] = "cookie";
    ParamType[ParamType["form"] = 4] = "form";
    ParamType[ParamType["body"] = 5] = "body";
    ParamType[ParamType["file"] = 6] = "file";
    ParamType[ParamType["files"] = 7] = "files";
    ParamType[ParamType["context"] = 8] = "context";
    ParamType[ParamType["context_request"] = 9] = "context_request";
    ParamType[ParamType["context_response"] = 10] = "context_response";
    ParamType[ParamType["context_next"] = 11] = "context_next";
    ParamType[ParamType["context_accept"] = 12] = "context_accept";
    ParamType[ParamType["context_accept_language"] = 13] = "context_accept_language";
})(exports.ParamType || (exports.ParamType = {}));
var ParamType = exports.ParamType;

//# sourceMappingURL=metadata.js.map
