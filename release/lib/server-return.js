"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var server_types_1 = require("./server-types");
var NewResource = (function (_super) {
    __extends(NewResource, _super);
    function NewResource(location) {
        return _super.call(this, location, 201) || this;
    }
    return NewResource;
}(server_types_1.ReferencedResource));
exports.NewResource = NewResource;
var RequestAccepted = (function (_super) {
    __extends(RequestAccepted, _super);
    function RequestAccepted(location) {
        return _super.call(this, location, 202) || this;
    }
    return RequestAccepted;
}(server_types_1.ReferencedResource));
exports.RequestAccepted = RequestAccepted;
var MovedPermanently = (function (_super) {
    __extends(MovedPermanently, _super);
    function MovedPermanently(location) {
        return _super.call(this, location, 301) || this;
    }
    return MovedPermanently;
}(server_types_1.ReferencedResource));
exports.MovedPermanently = MovedPermanently;
var MovedTemporarily = (function (_super) {
    __extends(MovedTemporarily, _super);
    function MovedTemporarily(location) {
        return _super.call(this, location, 302) || this;
    }
    return MovedTemporarily;
}(server_types_1.ReferencedResource));
exports.MovedTemporarily = MovedTemporarily;
var DownloadResource = (function () {
    function DownloadResource(filePath, fileName) {
        this.filePath = filePath;
        this.fileName = fileName;
    }
    return DownloadResource;
}());
exports.DownloadResource = DownloadResource;
var DownloadBinaryData = (function () {
    function DownloadBinaryData(content, mimeType, fileName) {
        this.content = content;
        this.mimeType = mimeType;
        this.fileName = fileName;
    }
    return DownloadBinaryData;
}());
exports.DownloadBinaryData = DownloadBinaryData;

//# sourceMappingURL=server-return.js.map
