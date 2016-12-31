"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["HEAD"] = 4] = "HEAD";
    HttpMethod[HttpMethod["OPTIONS"] = 5] = "OPTIONS";
    HttpMethod[HttpMethod["PATCH"] = 6] = "PATCH";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
var ServiceContext = (function () {
    function ServiceContext() {
    }
    return ServiceContext;
}());
exports.ServiceContext = ServiceContext;
var HttpError = (function (_super) {
    __extends(HttpError, _super);
    function HttpError(name, statusCode, message) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.message = message;
        _this.name = name;
        return _this;
    }
    return HttpError;
}(Error));
exports.HttpError = HttpError;
var ReferencedResource = (function () {
    function ReferencedResource(location, statusCode) {
        this.location = location;
        this.statusCode = statusCode;
    }
    return ReferencedResource;
}());
exports.ReferencedResource = ReferencedResource;

//# sourceMappingURL=server-types.js.map
