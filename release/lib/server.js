"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server_container_1 = require("./server-container");

var Server = function () {
    function Server() {
        (0, _classCallCheck3.default)(this, Server);
    }

    (0, _createClass3.default)(Server, null, [{
        key: "buildServices",
        value: function buildServices(router) {
            var iternalServer = new server_container_1.InternalServer(router);
            iternalServer.buildServices();
        }
    }, {
        key: "getPaths",
        value: function getPaths() {
            return server_container_1.InternalServer.getPaths();
        }
    }, {
        key: "getHttpMethods",
        value: function getHttpMethods(path) {
            return server_container_1.InternalServer.getHttpMethods(path);
        }
    }, {
        key: "setCookiesSecret",
        value: function setCookiesSecret(secret) {
            server_container_1.InternalServer.cookiesSecret = secret;
        }
    }, {
        key: "setCookiesDecoder",
        value: function setCookiesDecoder(decoder) {
            server_container_1.InternalServer.cookiesDecoder = decoder;
        }
    }, {
        key: "setFileDest",
        value: function setFileDest(dest) {
            server_container_1.InternalServer.fileDest = dest;
        }
    }, {
        key: "setFileFilter",
        value: function setFileFilter(filter) {
            server_container_1.InternalServer.fileFilter = filter;
        }
    }, {
        key: "setFileLimits",
        value: function setFileLimits(limit) {
            server_container_1.InternalServer.fileLimits = limit;
        }
    }]);
    return Server;
}();

exports.Server = Server;
//# sourceMappingURL=server.js.map
