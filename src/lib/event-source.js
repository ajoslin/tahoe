import join from 'url-join'
import extend from 'xtend'
import qs from 'querystring'
import once from 'once'

export default once(getEventSource)

function getEventSource (opt) {
  const query = qs.stringify(extend({
    token: getToken(opt)
  }, opt.query || {}))

  return new EventSource(join(opt.api, '_eventsource') + '?' + query)
}

function getToken (opt) {
  const auth = opt.headers && opt.headers.authorization || opt.headers.Authorization
  const token = auth && /^Bearer /.test(String(auth)) && auth.split(' ')[1]

  return token || ''
}
