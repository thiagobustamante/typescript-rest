"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _metadata = require("babel-runtime/core-js/reflect/metadata");

var _metadata2 = _interopRequireDefault(_metadata);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = (0, _getOwnPropertyDescriptor2.default)(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : (0, _typeof3.default)(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && (0, _defineProperty2.default)(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
    if ((typeof Reflect === "undefined" ? "undefined" : (0, _typeof3.default)(Reflect)) === "object" && typeof _metadata2.default === "function") return (0, _metadata2.default)(k, v);
};
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
    return function (target, key) {
        decorator(target, key, paramIndex);
    };
};
var express = require("express");
var request = require('request');
var fs = require("fs");
var typescript_rest_1 = require("../lib/typescript-rest");

var Person = function Person(id, name, age) {
    (0, _classCallCheck3.default)(this, Person);

    this.id = id;
    this.name = name;
    this.age = age;
};

var PersonService = function () {
    function PersonService() {
        (0, _classCallCheck3.default)(this, PersonService);
    }

    (0, _createClass3.default)(PersonService, [{
        key: "getPerson",
        value: function getPerson(id) {
            return new _promise2.default(function (resolve, reject) {
                resolve(new Person(id, "Fulano de Tal número " + id.toString(), 35));
            });
        }
    }, {
        key: "setPerson",
        value: function setPerson(person) {
            return true;
        }
    }, {
        key: "getAll",
        value: function getAll(start, size) {
            var result = new Array();
            for (var i = start; i < start + size; i++) {
                result.push(new Person(i, "Fulano de Tal número " + i.toString(), 35));
            }
            return result;
        }
    }]);
    return PersonService;
}();
__decorate([typescript_rest_1.Path(":id"), typescript_rest_1.GET, __param(0, typescript_rest_1.PathParam('id')), __metadata('design:type', Function), __metadata('design:paramtypes', [Number]), __metadata('design:returntype', _promise2.default)], PersonService.prototype, "getPerson", null);
__decorate([typescript_rest_1.PUT, typescript_rest_1.Path("/:id"), __metadata('design:type', Function), __metadata('design:paramtypes', [Person]), __metadata('design:returntype', Boolean)], PersonService.prototype, "setPerson", null);
__decorate([typescript_rest_1.GET, __param(0, typescript_rest_1.QueryParam('start')), __param(1, typescript_rest_1.QueryParam('size')), __metadata('design:type', Function), __metadata('design:paramtypes', [Number, Number]), __metadata('design:returntype', Array)], PersonService.prototype, "getAll", null);
PersonService = __decorate([typescript_rest_1.Path("/person"), __metadata('design:paramtypes', [])], PersonService);

var TestParams = function () {
    function TestParams() {
        (0, _classCallCheck3.default)(this, TestParams);
    }

    (0, _createClass3.default)(TestParams, [{
        key: "testHeaders",
        value: function testHeaders(header, cookie) {
            return "cookie: " + cookie + "|header: " + header;
        }
    }, {
        key: "testContext",
        value: function testContext(q, request, response, next) {
            if (request && response && next) {
                response.status(201);
                if (q === "123") {
                    response.send(true);
                } else {
                    response.send(false);
                }
            }
        }
    }, {
        key: "testUploadFile",
        value: function testUploadFile(file, myField) {
            return file && file.buffer.toString().startsWith('"use strict";') && myField === "my_value";
        }
    }]);
    return TestParams;
}();

__decorate([typescript_rest_1.Context, __metadata('design:type', typescript_rest_1.ServiceContext)], TestParams.prototype, "context", void 0);
__decorate([typescript_rest_1.GET, typescript_rest_1.Path("headers"), __param(0, typescript_rest_1.HeaderParam('my-header')), __param(1, typescript_rest_1.CookieParam('my-cookie')), __metadata('design:type', Function), __metadata('design:paramtypes', [String, String]), __metadata('design:returntype', String)], TestParams.prototype, "testHeaders", null);
__decorate([typescript_rest_1.GET, typescript_rest_1.Path("context"), __param(0, typescript_rest_1.QueryParam('q')), __param(1, typescript_rest_1.ContextRequest), __param(2, typescript_rest_1.ContextResponse), __param(3, typescript_rest_1.ContextNext), __metadata('design:type', Function), __metadata('design:paramtypes', [String, Object, Object, Function]), __metadata('design:returntype', void 0)], TestParams.prototype, "testContext", null);
__decorate([typescript_rest_1.POST, typescript_rest_1.Path("upload"), __param(0, typescript_rest_1.FileParam("myFile")), __param(1, typescript_rest_1.FormParam("myField")), __metadata('design:type', Function), __metadata('design:paramtypes', [Object, String]), __metadata('design:returntype', Boolean)], TestParams.prototype, "testUploadFile", null);
var AcceptTest = function () {
    function AcceptTest() {
        (0, _classCallCheck3.default)(this, AcceptTest);
    }

    (0, _createClass3.default)(AcceptTest, [{
        key: "testLanguage",
        value: function testLanguage(language) {
            if (language === 'en') {
                return "accepted";
            }
            return "aceito";
        }
    }, {
        key: "testAccepts",
        value: function testAccepts(type) {
            if (type === 'application/json') {
                return "accepted";
            }
            return "not accepted";
        }
    }, {
        key: "testConflict",
        value: function testConflict() {
            throw new typescript_rest_1.Errors.ConflictError("test of conflict");
        }
    }, {
        key: "testConflictAsync",
        value: function testConflictAsync() {
            return new _promise2.default(function (resolve, reject) {
                throw new typescript_rest_1.Errors.ConflictError("test of conflict");
            });
        }
    }]);
    return AcceptTest;
}();
__decorate([typescript_rest_1.GET, __param(0, typescript_rest_1.ContextLanguage), __metadata('design:type', Function), __metadata('design:paramtypes', [String]), __metadata('design:returntype', String)], AcceptTest.prototype, "testLanguage", null);
__decorate([typescript_rest_1.GET, typescript_rest_1.Path("types"), typescript_rest_1.Accept("application/json"), __param(0, typescript_rest_1.ContextAccept), __metadata('design:type', Function), __metadata('design:paramtypes', [String]), __metadata('design:returntype', String)], AcceptTest.prototype, "testAccepts", null);
__decorate([typescript_rest_1.PUT, typescript_rest_1.Path("conflict"), __metadata('design:type', Function), __metadata('design:paramtypes', []), __metadata('design:returntype', String)], AcceptTest.prototype, "testConflict", null);
__decorate([typescript_rest_1.POST, typescript_rest_1.Path("conflict"), __metadata('design:type', Function), __metadata('design:paramtypes', []), __metadata('design:returntype', _promise2.default)], AcceptTest.prototype, "testConflictAsync", null);
AcceptTest = __decorate([typescript_rest_1.Path("/accept"), typescript_rest_1.AcceptLanguage("en", "pt-BR"), __metadata('design:paramtypes', [])], AcceptTest);
var app = express();
app.set('env', 'test');
typescript_rest_1.Server.buildServices(app);
var server = void 0;
describe("Server Tests", function () {
    beforeAll(function () {
        server = app.listen(3000);
    });
    afterAll(function () {
        server.close();
    });
    describe("Server", function () {
        it("should provide a catalog containing the exposed paths", function () {
            expect(typescript_rest_1.Server.getPaths().has("/person/:id")).toEqual(true);
            expect(typescript_rest_1.Server.getPaths().has("/headers")).toEqual(true);
            expect(typescript_rest_1.Server.getPaths().has("/context")).toEqual(true);
            expect(typescript_rest_1.Server.getPaths().has("/upload")).toEqual(true);
            expect(typescript_rest_1.Server.getHttpMethods("/person/:id").has(typescript_rest_1.HttpMethod.GET)).toEqual(true);
            expect(typescript_rest_1.Server.getHttpMethods("/person/:id").has(typescript_rest_1.HttpMethod.PUT)).toEqual(true);
            expect(typescript_rest_1.Server.getPaths().has("/accept")).toEqual(true);
            expect(typescript_rest_1.Server.getPaths().has("/accept/conflict")).toEqual(true);
        });
    });
    describe("PersonService", function () {
        it("should return the person (123) for GET on path: /person/123", function (done) {
            request("http://localhost:3000/person/123", function (error, response, body) {
                var result = JSON.parse(body);
                expect(result.id).toEqual(123);
                done();
            });
        });
        it("should return true for PUT on path: /person/123", function (done) {
            request.put({
                headers: { 'content-type': 'application/json' },
                url: "http://localhost:3000/person/123",
                body: (0, _stringify2.default)(new Person(123, "Fulano de Tal número 123", 35))
            }, function (error, response, body) {
                expect(body).toEqual("true");
                done();
            });
        });
        it("should return an array with 3 elements for GET on path: /person?start=0&size=3", function (done) {
            request("http://localhost:3000/person?start=0&size=3", function (error, response, body) {
                var result = JSON.parse(body);
                expect(result.length).toEqual(3);
                done();
            });
        });
    });
    describe("TestParams", function () {
        it("should parse header and cookies correclty", function (done) {
            request({
                headers: { 'my-header': 'header value', 'Cookie': 'my-cookie=cookie value' },
                url: "http://localhost:3000/headers"
            }, function (error, response, body) {
                expect(body).toEqual("cookie: cookie value|header: header value");
                done();
            });
        });
        it("should accept Context parameters", function (done) {
            request({
                url: "http://localhost:3000/context?q=123"
            }, function (error, response, body) {
                expect(body).toEqual("true");
                expect(response.statusCode).toEqual(201);
                done();
            });
        });
        it("should accept file parameters", function (done) {
            var req = request.post("http://localhost:3000/upload", function (error, response, body) {
                expect(body).toEqual("true");
                expect(response.statusCode).toEqual(200);
                done();
            });
            var form = req.form();
            form.append('myField', 'my_value');
            form.append('myFile', fs.createReadStream(__dirname + '/test-rest.spec.js'), 'test-rest.spec.js');
        });
    });
    describe("AcceptTest", function () {
        it("should choose language correctly", function (done) {
            request({
                headers: { 'Accept-Language': 'pt-BR' },
                url: "http://localhost:3000/accept"
            }, function (error, response, body) {
                expect(body).toEqual("aceito");
                done();
            });
        });
        it("should reject unacceptable languages", function (done) {
            request({
                headers: { 'Accept-Language': 'fr' },
                url: "http://localhost:3000/accept"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(406);
                done();
            });
        });
        it("should use default language if none specified", function (done) {
            request({
                url: "http://localhost:3000/accept"
            }, function (error, response, body) {
                expect(body).toEqual("accepted");
                done();
            });
        });
        it("should use default media type if none specified", function (done) {
            request({
                url: "http://localhost:3000/accept/types"
            }, function (error, response, body) {
                expect(body).toEqual("accepted");
                done();
            });
        });
        it("should handle RestErrors", function (done) {
            request.put({
                headers: { 'Accept': 'text/html' },
                url: "http://localhost:3000/accept/conflict"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(409);
                done();
            });
        });
        it("should handle RestErrors on Async calls", function (done) {
            request.post({
                headers: { 'Accept': 'text/html' },
                url: "http://localhost:3000/accept/conflict"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(409);
                done();
            });
        });
        it("should reject unacceptable media types", function (done) {
            request({
                headers: { 'Accept': 'text/html' },
                url: "http://localhost:3000/accept/types"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(406);
                done();
            });
        });
    });
});
//# sourceMappingURL=test-rest.spec.js.map
