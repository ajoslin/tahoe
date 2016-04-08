'use strict'

var entify = require('./entify')
var superagent = require('superagent')
var xtend = require('xtend')
var cuid = require('cuid')
var getSocket = require('./socket')

var sessionId = 'session_' + cuid()

var handleMessage = function handleMessage (opt, dispatch, fn, data) {
  try {
    fn(data, opt, dispatch)
  } catch (err) {
    dispatch({
      type: 'tahoe.failure',
      meta: opt,
      payload: err
    })
  }
}

var handleInsert = function handleInsert (_ref, opt, dispatch) {
  var next = _ref.next
  return dispatch({
    type: 'tahoe.tail.insert',
    meta: opt,
    payload: {
      normalized: entify(next, opt),
      raw: next
    }
  })
}
var handleUpdate = function handleUpdate (_ref2, opt, dispatch) {
  var prev = _ref2.prev
  var next = _ref2.next
  return dispatch({
    type: 'tahoe.tail.update',
    meta: opt,
    payload: {
      normalized: {
        prev: entify(prev, opt),
        next: entify(next, opt)
      },
      raw: {
        prev: prev,
        next: next
      }
    }
  })
}
var handleDelete = function handleDelete (_ref3, opt, dispatch) {
  var prev = _ref3.prev
  return dispatch({
    type: 'tahoe.tail.delete',
    meta: opt,
    payload: {
      normalized: entify(prev, opt),
      raw: prev
    }
  })
}

var typeHandler = {
  insert: handleInsert,
  update: handleUpdate,
  delete: handleDelete
}

module.exports = function createTail (opt, dispatch) {
  var req = superagent.get(opt.endpoint)
  var tailId = 'tail_' + cuid()

  opt.query = xtend({
    sessionId: sessionId,
    tailId: tailId
  }, opt.query || {})

  if (opt.headers) req.set(opt.headers)
  if (opt.query) req.query(opt.query)
  if (opt.withCredentials) req.withCredentials()

  getSocket(opt, function (socket) {
    console.log('init tail!', tailId)
    req.end()

    socket.on('server.sutro', function (event) {
      var handler = typeHandler[event.type]

      if (!handler) throw new Error('Event type', event.type, 'not recognized')
      if (event.tailId !== tailId) return

      handleMessage(opt, dispatch, handler, event.data)
    })
  })
}
