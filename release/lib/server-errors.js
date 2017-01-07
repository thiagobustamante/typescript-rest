"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var server_types_1 = require("./server-types");
var BadRequestError = (function (_super) {
    __extends(BadRequestError, _super);
    function BadRequestError(message) {
        var _this = _super.call(this, "BadRequestError", 400, message || "Bad Request") || this;
        Object["setPrototypeOf"](_this, BadRequestError.prototype);
        return _this;
    }
    return BadRequestError;
}(server_types_1.HttpError));
exports.BadRequestError = BadRequestError;
var UnauthorizedError = (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message) {
        var _this = _super.call(this, "UnauthorizedError", 401, message || "Unauthorized") || this;
        Object["setPrototypeOf"](_this, UnauthorizedError.prototype);
        return _this;
    }
    return UnauthorizedError;
}(server_types_1.HttpError));
exports.UnauthorizedError = UnauthorizedError;
var ForbidenError = (function (_super) {
    __extends(ForbidenError, _super);
    function ForbidenError(message) {
        var _this = _super.call(this, "ForbidenError", 403, message || "Forbiden") || this;
        Object["setPrototypeOf"](_this, ForbidenError.prototype);
        return _this;
    }
    return ForbidenError;
}(server_types_1.HttpError));
exports.ForbidenError = ForbidenError;
var NotFoundError = (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        var _this = _super.call(this, "NotFoundError", 404, message || "Not Found") || this;
        Object["setPrototypeOf"](_this, NotFoundError.prototype);
        return _this;
    }
    return NotFoundError;
}(server_types_1.HttpError));
exports.NotFoundError = NotFoundError;
var MethodNotAllowedError = (function (_super) {
    __extends(MethodNotAllowedError, _super);
    function MethodNotAllowedError(message) {
        var _this = _super.call(this, "MethodNotAllowedError", 405, message || "Method Not Allowed") || this;
        Object["setPrototypeOf"](_this, MethodNotAllowedError.prototype);
        return _this;
    }
    return MethodNotAllowedError;
}(server_types_1.HttpError));
exports.MethodNotAllowedError = MethodNotAllowedError;
var NotAcceptableError = (function (_super) {
    __extends(NotAcceptableError, _super);
    function NotAcceptableError(message) {
        var _this = _super.call(this, "NotAcceptableError", 406, message || "Not Acceptable") || this;
        Object["setPrototypeOf"](_this, NotAcceptableError.prototype);
        return _this;
    }
    return NotAcceptableError;
}(server_types_1.HttpError));
exports.NotAcceptableError = NotAcceptableError;
var ConflictError = (function (_super) {
    __extends(ConflictError, _super);
    function ConflictError(message) {
        var _this = _super.call(this, "ConflictError", 409, message || "Conflict") || this;
        Object["setPrototypeOf"](_this, ConflictError.prototype);
        return _this;
    }
    return ConflictError;
}(server_types_1.HttpError));
exports.ConflictError = ConflictError;
var GoneError = (function (_super) {
    __extends(GoneError, _super);
    function GoneError(message) {
        var _this = _super.call(this, "GoneError", 410, message || "Gone") || this;
        Object["setPrototypeOf"](_this, GoneError.prototype);
        return _this;
    }
    return GoneError;
}(server_types_1.HttpError));
exports.GoneError = GoneError;
var UnsupportedMediaTypeError = (function (_super) {
    __extends(UnsupportedMediaTypeError, _super);
    function UnsupportedMediaTypeError(message) {
        var _this = _super.call(this, "UnsupportedMediaTypeError", 415, message || "Unsupported Media Type") || this;
        Object["setPrototypeOf"](_this, UnsupportedMediaTypeError.prototype);
        return _this;
    }
    return UnsupportedMediaTypeError;
}(server_types_1.HttpError));
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
var InternalServerError = (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(message) {
        var _this = _super.call(this, "InternalServerError", 500, message || "Internal Server Error") || this;
        Object["setPrototypeOf"](_this, InternalServerError.prototype);
        return _this;
    }
    return InternalServerError;
}(server_types_1.HttpError));
exports.InternalServerError = InternalServerError;
var NotImplementedError = (function (_super) {
    __extends(NotImplementedError, _super);
    function NotImplementedError(message) {
        var _this = _super.call(this, "NotImplementedError", 501, message || "Not Implemented") || this;
        Object["setPrototypeOf"](_this, NotImplementedError.prototype);
        return _this;
    }
    return NotImplementedError;
}(server_types_1.HttpError));
exports.NotImplementedError = NotImplementedError;

//# sourceMappingURL=server-errors.js.map
