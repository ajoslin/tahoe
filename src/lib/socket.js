var socketIo = require('socket.io-client')
var qs = require('querystring')

var connected
var io
module.exports = function getSocket (opt, callback) {
  if (!io) {
    io = socketIo.connect(opt.server, {
      query: qs.stringify({
        sessionId: opt.query.sessionId,
        token: getToken(opt)
      })
    })
      .on('error', console.error.bind(console, 'Socket Error!'))
      .on('connect', console.log.bind(console, 'Socket Connected!'))
      .on('reconnect', function () { window.location.reload() })
  }
  if (!connected) {
    io.on('connect', function () {
      connected = true
      callback(io)
    })
  } else {
    callback(io)
  }
}

function getToken (opt) {
  var auth = opt.headers && opt.headers.authorization || opt.headers.Authorization
  var token = auth && /^Bearer /.test(String(auth)) && auth.split(' ')[1]

  return token || ''
}
