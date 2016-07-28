"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.ServiceClass = ServiceClass;

var ServiceMethod = function ServiceMethod() {
    (0, _classCallCheck3.default)(this, ServiceMethod);

    this.parameters = new Array();
    this.mustParseCookies = false;
    this.files = new Array();
    this.mustParseBody = false;
    this.mustParseForms = false;
};

exports.ServiceMethod = ServiceMethod;

var FileParam = function FileParam(name, singleFile) {
    (0, _classCallCheck3.default)(this, FileParam);

    this.name = name;
    this.singleFile = singleFile;
};

exports.FileParam = FileParam;

var MethodParam = function MethodParam(name, type, paramType) {
    (0, _classCallCheck3.default)(this, MethodParam);

    this.name = name;
    this.type = type;
    this.paramType = paramType;
};

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
