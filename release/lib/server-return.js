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

var NewResource = function (_server_types_1$Refer) {
    (0, _inherits3.default)(NewResource, _server_types_1$Refer);

    function NewResource(location) {
        (0, _classCallCheck3.default)(this, NewResource);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NewResource).call(this, location, 201));
    }

    return NewResource;
}(server_types_1.ReferencedResource);

exports.NewResource = NewResource;

var RequestAccepted = function (_server_types_1$Refer2) {
    (0, _inherits3.default)(RequestAccepted, _server_types_1$Refer2);

    function RequestAccepted(location) {
        (0, _classCallCheck3.default)(this, RequestAccepted);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(RequestAccepted).call(this, location, 202));
    }

    return RequestAccepted;
}(server_types_1.ReferencedResource);

exports.RequestAccepted = RequestAccepted;

var MovedPermanently = function (_server_types_1$Refer3) {
    (0, _inherits3.default)(MovedPermanently, _server_types_1$Refer3);

    function MovedPermanently(location) {
        (0, _classCallCheck3.default)(this, MovedPermanently);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MovedPermanently).call(this, location, 301));
    }

    return MovedPermanently;
}(server_types_1.ReferencedResource);

exports.MovedPermanently = MovedPermanently;

var MovedTemporarily = function (_server_types_1$Refer4) {
    (0, _inherits3.default)(MovedTemporarily, _server_types_1$Refer4);

    function MovedTemporarily(location) {
        (0, _classCallCheck3.default)(this, MovedTemporarily);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MovedTemporarily).call(this, location, 302));
    }

    return MovedTemporarily;
}(server_types_1.ReferencedResource);

exports.MovedTemporarily = MovedTemporarily;
//# sourceMappingURL=server-return.js.map
