"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var ServiceContext = function ServiceContext() {
    (0, _classCallCheck3.default)(this, ServiceContext);
};

exports.ServiceContext = ServiceContext;

var RestError = function (_Error) {
    (0, _inherits3.default)(RestError, _Error);

    function RestError(name, statusCode, message) {
        (0, _classCallCheck3.default)(this, RestError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(RestError).call(this, message));

        _this.statusCode = statusCode;
        _this.message = message;
        _this.name = name;
        _this.stack = new Error().stack;
        return _this;
    }

    return RestError;
}(Error);

exports.RestError = RestError;
//# sourceMappingURL=server-types.js.map
