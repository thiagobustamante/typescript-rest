"use strict";
var __cov_k2oA40wExFS28Bb_ozpNPg = (Function('return this'))();
if (!__cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1473961608688$$) { __cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1473961608688$$ = {}; }
__cov_k2oA40wExFS28Bb_ozpNPg = __cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1473961608688$$;
if (!(__cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'])) {
   __cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'] = {"path":"release/lib/server.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1,"8":0,"9":0,"10":0,"11":1,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0},"b":{"1":[0,0],"2":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0},"fnMap":{"1":{"name":"_interopRequireDefault","line":15,"loc":{"start":{"line":15,"column":0},"end":{"line":15,"column":37}}},"2":{"name":"(anonymous_2)","line":19,"loc":{"start":{"line":19,"column":13},"end":{"line":19,"column":25}}},"3":{"name":"Server","line":20,"loc":{"start":{"line":20,"column":4},"end":{"line":20,"column":22}}},"4":{"name":"buildServices","line":26,"loc":{"start":{"line":26,"column":15},"end":{"line":26,"column":46}}},"5":{"name":"getPaths","line":32,"loc":{"start":{"line":32,"column":15},"end":{"line":32,"column":35}}},"6":{"name":"getHttpMethods","line":37,"loc":{"start":{"line":37,"column":15},"end":{"line":37,"column":45}}},"7":{"name":"setCookiesSecret","line":42,"loc":{"start":{"line":42,"column":15},"end":{"line":42,"column":49}}},"8":{"name":"setCookiesDecoder","line":47,"loc":{"start":{"line":47,"column":15},"end":{"line":47,"column":51}}},"9":{"name":"setFileDest","line":52,"loc":{"start":{"line":52,"column":15},"end":{"line":52,"column":42}}},"10":{"name":"setFileFilter","line":57,"loc":{"start":{"line":57,"column":15},"end":{"line":57,"column":46}}},"11":{"name":"setFileLimits","line":62,"loc":{"start":{"line":62,"column":15},"end":{"line":62,"column":45}}}},"statementMap":{"1":{"start":{"line":3,"column":0},"end":{"line":3,"column":77}},"2":{"start":{"line":5,"column":0},"end":{"line":5,"column":70}},"3":{"start":{"line":7,"column":0},"end":{"line":7,"column":71}},"4":{"start":{"line":9,"column":0},"end":{"line":9,"column":64}},"5":{"start":{"line":11,"column":0},"end":{"line":11,"column":65}},"6":{"start":{"line":13,"column":0},"end":{"line":13,"column":58}},"7":{"start":{"line":15,"column":0},"end":{"line":15,"column":95}},"8":{"start":{"line":15,"column":39},"end":{"line":15,"column":93}},"9":{"start":{"line":17,"column":0},"end":{"line":17,"column":55}},"10":{"start":{"line":19,"column":0},"end":{"line":67,"column":4}},"11":{"start":{"line":20,"column":4},"end":{"line":22,"column":5}},"12":{"start":{"line":21,"column":8},"end":{"line":21,"column":52}},"13":{"start":{"line":24,"column":4},"end":{"line":65,"column":8}},"14":{"start":{"line":27,"column":12},"end":{"line":27,"column":78}},"15":{"start":{"line":28,"column":12},"end":{"line":28,"column":42}},"16":{"start":{"line":33,"column":12},"end":{"line":33,"column":109}},"17":{"start":{"line":38,"column":12},"end":{"line":38,"column":119}},"18":{"start":{"line":43,"column":12},"end":{"line":43,"column":69}},"19":{"start":{"line":48,"column":12},"end":{"line":48,"column":71}},"20":{"start":{"line":53,"column":12},"end":{"line":53,"column":62}},"21":{"start":{"line":58,"column":12},"end":{"line":58,"column":66}},"22":{"start":{"line":63,"column":12},"end":{"line":63,"column":65}},"23":{"start":{"line":66,"column":4},"end":{"line":66,"column":18}},"24":{"start":{"line":69,"column":0},"end":{"line":69,"column":24}}},"branchMap":{"1":{"line":15,"type":"cond-expr","locations":[{"start":{"line":15,"column":70},"end":{"line":15,"column":73}},{"start":{"line":15,"column":76},"end":{"line":15,"column":92}}]},"2":{"line":15,"type":"binary-expr","locations":[{"start":{"line":15,"column":46},"end":{"line":15,"column":49}},{"start":{"line":15,"column":53},"end":{"line":15,"column":67}}]}}};
}
__cov_k2oA40wExFS28Bb_ozpNPg = __cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'];
__cov_k2oA40wExFS28Bb_ozpNPg.s['1']++;
var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');
__cov_k2oA40wExFS28Bb_ozpNPg.s['2']++;
var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
__cov_k2oA40wExFS28Bb_ozpNPg.s['3']++;
var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
__cov_k2oA40wExFS28Bb_ozpNPg.s['4']++;
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
__cov_k2oA40wExFS28Bb_ozpNPg.s['5']++;
var _createClass2 = require('babel-runtime/helpers/createClass');
__cov_k2oA40wExFS28Bb_ozpNPg.s['6']++;
var _createClass3 = _interopRequireDefault(_createClass2);
function _interopRequireDefault(obj) {
    __cov_k2oA40wExFS28Bb_ozpNPg.f['1']++;
    __cov_k2oA40wExFS28Bb_ozpNPg.s['8']++;
    return (__cov_k2oA40wExFS28Bb_ozpNPg.b['2'][0]++, obj) && (__cov_k2oA40wExFS28Bb_ozpNPg.b['2'][1]++, obj.__esModule) ? (__cov_k2oA40wExFS28Bb_ozpNPg.b['1'][0]++, obj) : (__cov_k2oA40wExFS28Bb_ozpNPg.b['1'][1]++, { default: obj });
}
__cov_k2oA40wExFS28Bb_ozpNPg.s['9']++;
var server_container_1 = require('./server-container');
__cov_k2oA40wExFS28Bb_ozpNPg.s['10']++;
var Server = function () {
    __cov_k2oA40wExFS28Bb_ozpNPg.f['2']++;
    function Server() {
        __cov_k2oA40wExFS28Bb_ozpNPg.f['3']++;
        __cov_k2oA40wExFS28Bb_ozpNPg.s['12']++;
        (0, _classCallCheck3.default)(this, Server);
    }
    __cov_k2oA40wExFS28Bb_ozpNPg.s['13']++;
    (0, _createClass3.default)(Server, null, [
        {
            key: 'buildServices',
            value: function buildServices(router) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['4']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['14']++;
                var iternalServer = new server_container_1.InternalServer(router);
                __cov_k2oA40wExFS28Bb_ozpNPg.s['15']++;
                iternalServer.buildServices();
            }
        },
        {
            key: 'getPaths',
            value: function getPaths() {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['5']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['16']++;
                return [].concat((0, _toConsumableArray3.default)(server_container_1.InternalServer.getPaths()));
            }
        },
        {
            key: 'getHttpMethods',
            value: function getHttpMethods(path) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['6']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['17']++;
                return [].concat((0, _toConsumableArray3.default)(server_container_1.InternalServer.getHttpMethods(path)));
            }
        },
        {
            key: 'setCookiesSecret',
            value: function setCookiesSecret(secret) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['7']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['18']++;
                server_container_1.InternalServer.cookiesSecret = secret;
            }
        },
        {
            key: 'setCookiesDecoder',
            value: function setCookiesDecoder(decoder) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['8']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['19']++;
                server_container_1.InternalServer.cookiesDecoder = decoder;
            }
        },
        {
            key: 'setFileDest',
            value: function setFileDest(dest) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['9']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['20']++;
                server_container_1.InternalServer.fileDest = dest;
            }
        },
        {
            key: 'setFileFilter',
            value: function setFileFilter(filter) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['10']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['21']++;
                server_container_1.InternalServer.fileFilter = filter;
            }
        },
        {
            key: 'setFileLimits',
            value: function setFileLimits(limit) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['11']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['22']++;
                server_container_1.InternalServer.fileLimits = limit;
            }
        }
    ]);
    __cov_k2oA40wExFS28Bb_ozpNPg.s['23']++;
    return Server;
}();
__cov_k2oA40wExFS28Bb_ozpNPg.s['24']++;
exports.Server = Server;

//# sourceMappingURL=server.js.map
