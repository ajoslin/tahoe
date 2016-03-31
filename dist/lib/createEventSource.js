'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _entify = require('./entify');

var _entify2 = _interopRequireDefault(_entify);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _eventSource = require('./event-source');

var _eventSource2 = _interopRequireDefault(_eventSource);

var _xtend = require('xtend');

var _xtend2 = _interopRequireDefault(_xtend);

var _cuid = require('cuid');

var _cuid2 = _interopRequireDefault(_cuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleMessage = function handleMessage(opt, dispatch, fn, data) {
  try {
    fn(data, opt, dispatch);
  } catch (err) {
    dispatch({
      type: 'tahoe.failure',
      meta: opt,
      payload: err
    });
  }
};

var handleInsert = function handleInsert(_ref, opt, dispatch) {
  var next = _ref.next;
  return dispatch({
    type: 'tahoe.tail.insert',
    meta: opt,
    payload: {
      normalized: (0, _entify2.default)(next, opt),
      raw: next
    }
  });
};
var handleUpdate = function handleUpdate(_ref2, opt, dispatch) {
  var prev = _ref2.prev;
  var next = _ref2.next;
  return dispatch({
    type: 'tahoe.tail.update',
    meta: opt,
    payload: {
      normalized: {
        prev: (0, _entify2.default)(prev, opt),
        next: (0, _entify2.default)(next, opt)
      },
      raw: {
        prev: prev,
        next: next
      }
    }
  });
};
var handleDelete = function handleDelete(_ref3, opt, dispatch) {
  var prev = _ref3.prev;
  return dispatch({
    type: 'tahoe.tail.delete',
    meta: opt,
    payload: {
      normalized: (0, _entify2.default)(prev, opt),
      raw: prev
    }
  });
};

var typeHandler = {
  insert: handleInsert,
  update: handleUpdate,
  delete: handleDelete
};

exports.default = function (opt, dispatch) {
  var req = _superagent2.default.get(opt.endpoint);
  var tailId = 'tail_' + (0, _cuid2.default)();

  opt.query = (0, _xtend2.default)({ tailId: tailId }, opt.query || {});

  if (opt.headers) req.set(opt.headers);
  if (opt.query) req.query(opt.query);
  if (opt.withCredentials) req.withCredentials();

  req.end();

  var source = (0, _eventSource2.default)(opt);

  source.addEventListener('sutro', function (event) {
    var data = JSON.parse(event.data);
    var handler = typeHandler[data.type];

    if (!handler) throw new Error('Event type', data.type, 'not recognized');
    if (data.tailId !== tailId) return;

    handleMessage(opt, dispatch, handler, data.data);
  });
};

module.exports = exports['default'];