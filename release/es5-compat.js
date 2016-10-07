"use strict";
var ObjectUtils = require("underscore");
var StringMap = (function () {
    function StringMap() {
        this.data = {};
    }
    StringMap.prototype.has = function (key) {
        return ObjectUtils.has(this.data, key);
    };
    StringMap.prototype.get = function (key) {
        return this.data[key];
    };
    StringMap.prototype.set = function (key, value) {
        this.data[key] = value;
        return this;
    };
    StringMap.prototype.remove = function (key) {
        var value = this.get(key);
        delete this.data[key];
        return value;
    };
    StringMap.prototype.keys = function () {
        return ObjectUtils.keys(this.data);
    };
    StringMap.prototype.values = function () {
        return ObjectUtils.values(this.data);
    };
    StringMap.prototype.clear = function () {
        this.data = {};
        return this;
    };
    StringMap.prototype.forEach = function (fn) {
        ObjectUtils.forEach(this.data, fn);
        return this;
    };
    StringMap.prototype.size = function () {
        return ObjectUtils.size(this.data);
    };
    return StringMap;
}());
exports.StringMap = StringMap;
var Set = (function () {
    function Set(data) {
        this.data = [];
        if (data) {
            this.data = data;
        }
    }
    Set.prototype.has = function (value) {
        return ObjectUtils.contains(this.data, value);
    };
    Set.prototype.add = function (value) {
        if (!this.has(value)) {
            this.data.push(value);
        }
        return this;
    };
    Set.prototype.clear = function () {
        this.data = [];
        return this;
    };
    Set.prototype.forEach = function (fn) {
        ObjectUtils.forEach(this.data, fn);
        return this;
    };
    Set.prototype.asArray = function () {
        return ObjectUtils.clone(this.data);
    };
    return Set;
}());
exports.Set = Set;

//# sourceMappingURL=es5-compat.js.map
