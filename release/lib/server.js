"use strict";
var server_container_1 = require("./server-container");
var Server = (function () {
    function Server() {
    }
    Server.buildServices = function (router) {
        var iternalServer = new server_container_1.InternalServer(router);
        iternalServer.buildServices();
    };
    Server.getPaths = function () {
        return server_container_1.InternalServer.getPaths().asArray();
    };
    Server.getHttpMethods = function (path) {
        return server_container_1.InternalServer.getHttpMethods(path).asArray();
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
