"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server_types_1 = require("./server-types");

var BadRequestError = function (_server_types_1$HttpE) {
    (0, _inherits3.default)(BadRequestError, _server_types_1$HttpE);

    function BadRequestError(message) {
        (0, _classCallCheck3.default)(this, BadRequestError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BadRequestError).call(this, "BadRequestError", 400, message));
    }

    return BadRequestError;
}(server_types_1.HttpError);

exports.BadRequestError = BadRequestError;

var UnauthorizedError = function (_server_types_1$HttpE2) {
    (0, _inherits3.default)(UnauthorizedError, _server_types_1$HttpE2);

    function UnauthorizedError(message) {
        (0, _classCallCheck3.default)(this, UnauthorizedError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(UnauthorizedError).call(this, "UnauthorizedError", 401, message));
    }

    return UnauthorizedError;
}(server_types_1.HttpError);

exports.UnauthorizedError = UnauthorizedError;

var ForbidenError = function (_server_types_1$HttpE3) {
    (0, _inherits3.default)(ForbidenError, _server_types_1$HttpE3);

    function ForbidenError(message) {
        (0, _classCallCheck3.default)(this, ForbidenError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ForbidenError).call(this, "ForbidenError", 403, message));
    }

    return ForbidenError;
}(server_types_1.HttpError);

exports.ForbidenError = ForbidenError;

var NotFoundError = function (_server_types_1$HttpE4) {
    (0, _inherits3.default)(NotFoundError, _server_types_1$HttpE4);

    function NotFoundError(message) {
        (0, _classCallCheck3.default)(this, NotFoundError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NotFoundError).call(this, "NotFoundError", 404, message));
    }

    return NotFoundError;
}(server_types_1.HttpError);

exports.NotFoundError = NotFoundError;

var MethodNotAllowedError = function (_server_types_1$HttpE5) {
    (0, _inherits3.default)(MethodNotAllowedError, _server_types_1$HttpE5);

    function MethodNotAllowedError(message) {
        (0, _classCallCheck3.default)(this, MethodNotAllowedError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MethodNotAllowedError).call(this, "MethodNotAllowedError", 405, message));
    }

    return MethodNotAllowedError;
}(server_types_1.HttpError);

exports.MethodNotAllowedError = MethodNotAllowedError;

var NotAcceptableError = function (_server_types_1$HttpE6) {
    (0, _inherits3.default)(NotAcceptableError, _server_types_1$HttpE6);

    function NotAcceptableError(message) {
        (0, _classCallCheck3.default)(this, NotAcceptableError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NotAcceptableError).call(this, "NotAcceptableError", 406, message));
    }

    return NotAcceptableError;
}(server_types_1.HttpError);

exports.NotAcceptableError = NotAcceptableError;

var ConflictError = function (_server_types_1$HttpE7) {
    (0, _inherits3.default)(ConflictError, _server_types_1$HttpE7);

    function ConflictError(message) {
        (0, _classCallCheck3.default)(this, ConflictError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ConflictError).call(this, "ConflictError", 409, message));
    }

    return ConflictError;
}(server_types_1.HttpError);

exports.ConflictError = ConflictError;

var InternalServerError = function (_server_types_1$HttpE8) {
    (0, _inherits3.default)(InternalServerError, _server_types_1$HttpE8);

    function InternalServerError(message) {
        (0, _classCallCheck3.default)(this, InternalServerError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(InternalServerError).call(this, "InternalServerError", 500, message));
    }

    return InternalServerError;
}(server_types_1.HttpError);

exports.InternalServerError = InternalServerError;

var NotImplementedError = function (_server_types_1$HttpE9) {
    (0, _inherits3.default)(NotImplementedError, _server_types_1$HttpE9);

    function NotImplementedError(message) {
        (0, _classCallCheck3.default)(this, NotImplementedError);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NotImplementedError).call(this, "NotImplementedError", 501, message));
    }

    return NotImplementedError;
}(server_types_1.HttpError);

exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=server-errors.js.map
