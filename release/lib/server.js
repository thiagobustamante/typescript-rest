"use strict";
require("multer");
var server_container_1 = require("./server-container");
var Server = (function () {
    function Server() {
    }
    Server.buildServices = function (router) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        var iternalServer = new server_container_1.InternalServer(router);
        iternalServer.buildServices(types);
    };
    Server.getPaths = function () {
        var result = new Array();
        server_container_1.InternalServer.getPaths().forEach(function (value) {
            result.push(value);
        });
        return result;
    };
    Server.getHttpMethods = function (path) {
        var result = new Array();
        server_container_1.InternalServer.getHttpMethods(path).forEach(function (value) {
            result.push(value);
        });
        return result;
    };
    Server.setCookiesSecret = function (secret) {
        server_container_1.InternalServer.cookiesSecret = secret;
    };
    Server.setCookiesDecoder = function (decoder) {
        server_container_1.InternalServer.cookiesDecoder = decoder;
    };
    Server.setFileDest = function (dest) {
        server_container_1.InternalServer.fileDest = dest;
    };
    Server.setFileFilter = function (filter) {
        server_container_1.InternalServer.fileFilter = filter;
    };
    Server.setFileLimits = function (limit) {
        server_container_1.InternalServer.fileLimits = limit;
    };
    return Server;
}());
exports.Server = Server;

//# sourceMappingURL=server.js.map
