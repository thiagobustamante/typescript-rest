"use strict";
var __cov_k2oA40wExFS28Bb_ozpNPg = (Function('return this'))();
if (!__cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1470452961412$$) { __cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1470452961412$$ = {}; }
__cov_k2oA40wExFS28Bb_ozpNPg = __cov_k2oA40wExFS28Bb_ozpNPg.$$cov_1470452961412$$;
if (!(__cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'])) {
   __cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'] = {"path":"release/lib/server.js","s":{"1":0,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0,"8":0,"9":1,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0},"b":{"1":[0,0],"2":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0},"fnMap":{"1":{"name":"_interopRequireDefault","line":11,"loc":{"start":{"line":11,"column":0},"end":{"line":11,"column":37}}},"2":{"name":"(anonymous_2)","line":15,"loc":{"start":{"line":15,"column":13},"end":{"line":15,"column":25}}},"3":{"name":"Server","line":16,"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":22}}},"4":{"name":"buildServices","line":22,"loc":{"start":{"line":22,"column":15},"end":{"line":22,"column":46}}},"5":{"name":"getPaths","line":28,"loc":{"start":{"line":28,"column":15},"end":{"line":28,"column":35}}},"6":{"name":"getHttpMethods","line":33,"loc":{"start":{"line":33,"column":15},"end":{"line":33,"column":45}}},"7":{"name":"setCookiesSecret","line":38,"loc":{"start":{"line":38,"column":15},"end":{"line":38,"column":49}}},"8":{"name":"setCookiesDecoder","line":43,"loc":{"start":{"line":43,"column":15},"end":{"line":43,"column":51}}},"9":{"name":"setFileDest","line":48,"loc":{"start":{"line":48,"column":15},"end":{"line":48,"column":42}}},"10":{"name":"setFileFilter","line":53,"loc":{"start":{"line":53,"column":15},"end":{"line":53,"column":46}}},"11":{"name":"setFileLimits","line":58,"loc":{"start":{"line":58,"column":15},"end":{"line":58,"column":45}}}},"statementMap":{"1":{"start":{"line":3,"column":0},"end":{"line":3,"column":71}},"2":{"start":{"line":5,"column":0},"end":{"line":5,"column":64}},"3":{"start":{"line":7,"column":0},"end":{"line":7,"column":65}},"4":{"start":{"line":9,"column":0},"end":{"line":9,"column":58}},"5":{"start":{"line":11,"column":0},"end":{"line":11,"column":95}},"6":{"start":{"line":11,"column":39},"end":{"line":11,"column":93}},"7":{"start":{"line":13,"column":0},"end":{"line":13,"column":55}},"8":{"start":{"line":15,"column":0},"end":{"line":63,"column":4}},"9":{"start":{"line":16,"column":4},"end":{"line":18,"column":5}},"10":{"start":{"line":17,"column":8},"end":{"line":17,"column":52}},"11":{"start":{"line":20,"column":4},"end":{"line":61,"column":8}},"12":{"start":{"line":23,"column":12},"end":{"line":23,"column":78}},"13":{"start":{"line":24,"column":12},"end":{"line":24,"column":42}},"14":{"start":{"line":29,"column":12},"end":{"line":29,"column":64}},"15":{"start":{"line":34,"column":12},"end":{"line":34,"column":74}},"16":{"start":{"line":39,"column":12},"end":{"line":39,"column":69}},"17":{"start":{"line":44,"column":12},"end":{"line":44,"column":71}},"18":{"start":{"line":49,"column":12},"end":{"line":49,"column":62}},"19":{"start":{"line":54,"column":12},"end":{"line":54,"column":66}},"20":{"start":{"line":59,"column":12},"end":{"line":59,"column":65}},"21":{"start":{"line":62,"column":4},"end":{"line":62,"column":18}},"22":{"start":{"line":65,"column":0},"end":{"line":65,"column":24}}},"branchMap":{"1":{"line":11,"type":"cond-expr","locations":[{"start":{"line":11,"column":70},"end":{"line":11,"column":73}},{"start":{"line":11,"column":76},"end":{"line":11,"column":92}}]},"2":{"line":11,"type":"binary-expr","locations":[{"start":{"line":11,"column":46},"end":{"line":11,"column":49}},{"start":{"line":11,"column":53},"end":{"line":11,"column":67}}]}}};
}
__cov_k2oA40wExFS28Bb_ozpNPg = __cov_k2oA40wExFS28Bb_ozpNPg['release/lib/server.js'];
__cov_k2oA40wExFS28Bb_ozpNPg.s['1']++;
var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
__cov_k2oA40wExFS28Bb_ozpNPg.s['2']++;
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
__cov_k2oA40wExFS28Bb_ozpNPg.s['3']++;
var _createClass2 = require('babel-runtime/helpers/createClass');
__cov_k2oA40wExFS28Bb_ozpNPg.s['4']++;
var _createClass3 = _interopRequireDefault(_createClass2);
function _interopRequireDefault(obj) {
    __cov_k2oA40wExFS28Bb_ozpNPg.f['1']++;
    __cov_k2oA40wExFS28Bb_ozpNPg.s['6']++;
    return (__cov_k2oA40wExFS28Bb_ozpNPg.b['2'][0]++, obj) && (__cov_k2oA40wExFS28Bb_ozpNPg.b['2'][1]++, obj.__esModule) ? (__cov_k2oA40wExFS28Bb_ozpNPg.b['1'][0]++, obj) : (__cov_k2oA40wExFS28Bb_ozpNPg.b['1'][1]++, { default: obj });
}
__cov_k2oA40wExFS28Bb_ozpNPg.s['7']++;
var server_container_1 = require('./server-container');
__cov_k2oA40wExFS28Bb_ozpNPg.s['8']++;
var Server = function () {
    __cov_k2oA40wExFS28Bb_ozpNPg.f['2']++;
    function Server() {
        __cov_k2oA40wExFS28Bb_ozpNPg.f['3']++;
        __cov_k2oA40wExFS28Bb_ozpNPg.s['10']++;
        (0, _classCallCheck3.default)(this, Server);
    }
    __cov_k2oA40wExFS28Bb_ozpNPg.s['11']++;
    (0, _createClass3.default)(Server, null, [
        {
            key: 'buildServices',
            value: function buildServices(router) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['4']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['12']++;
                var iternalServer = new server_container_1.InternalServer(router);
                __cov_k2oA40wExFS28Bb_ozpNPg.s['13']++;
                iternalServer.buildServices();
            }
        },
        {
            key: 'getPaths',
            value: function getPaths() {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['5']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['14']++;
                return server_container_1.InternalServer.getPaths();
            }
        },
        {
            key: 'getHttpMethods',
            value: function getHttpMethods(path) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['6']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['15']++;
                return server_container_1.InternalServer.getHttpMethods(path);
            }
        },
        {
            key: 'setCookiesSecret',
            value: function setCookiesSecret(secret) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['7']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['16']++;
                server_container_1.InternalServer.cookiesSecret = secret;
            }
        },
        {
            key: 'setCookiesDecoder',
            value: function setCookiesDecoder(decoder) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['8']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['17']++;
                server_container_1.InternalServer.cookiesDecoder = decoder;
            }
        },
        {
            key: 'setFileDest',
            value: function setFileDest(dest) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['9']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['18']++;
                server_container_1.InternalServer.fileDest = dest;
            }
        },
        {
            key: 'setFileFilter',
            value: function setFileFilter(filter) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['10']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['19']++;
                server_container_1.InternalServer.fileFilter = filter;
            }
        },
        {
            key: 'setFileLimits',
            value: function setFileLimits(limit) {
                __cov_k2oA40wExFS28Bb_ozpNPg.f['11']++;
                __cov_k2oA40wExFS28Bb_ozpNPg.s['20']++;
                server_container_1.InternalServer.fileLimits = limit;
            }
        }
    ]);
    __cov_k2oA40wExFS28Bb_ozpNPg.s['21']++;
    return Server;
}();
__cov_k2oA40wExFS28Bb_ozpNPg.s['22']++;
exports.Server = Server;

//# sourceMappingURL=server.js.map
