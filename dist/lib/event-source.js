'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _xtend = require('xtend');

var _xtend2 = _interopRequireDefault(_xtend);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _once = require('once');

var _once2 = _interopRequireDefault(_once);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _once2.default)(getEventSource);


function getEventSource(opt) {
  var query = _querystring2.default.stringify((0, _xtend2.default)({
    token: getToken(opt)
  }, opt.query || {}));

  return new EventSource((0, _urlJoin2.default)(opt.api, '_eventsource') + '?' + query);
}

function getToken(opt) {
  var auth = opt.headers && opt.headers.authorization || opt.headers.Authorization;
  var token = auth && /^Bearer /.test(String(auth)) && auth.split(' ')[1];

  return token || '';
}
module.exports = exports['default'];