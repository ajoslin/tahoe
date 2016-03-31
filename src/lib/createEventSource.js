import entify from './entify'
import superagent from 'superagent'
import getEventSource from './event-source'
import extend from 'xtend'
import cuid from 'cuid'

const handleMessage = (opt, dispatch, fn, data) => {
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

const handleInsert = ({ next }, opt, dispatch) =>
  dispatch({
    type: 'tahoe.tail.insert',
    meta: opt,
    payload: {
      normalized: entify(next, opt),
      raw: next
    }
  })
const handleUpdate = ({ prev, next }, opt, dispatch) =>
  dispatch({
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
const handleDelete = ({ prev }, opt, dispatch) =>
  dispatch({
    type: 'tahoe.tail.delete',
    meta: opt,
    payload: {
      normalized: entify(prev, opt),
      raw: prev
    }
  })

const typeHandler = {
  insert: handleInsert,
  update: handleUpdate,
  delete: handleDelete
}

export default (opt, dispatch) => {
  const req = superagent.get(opt.endpoint)
  const tailId = 'tail_' + cuid()

  opt.query = extend({tailId}, opt.query || {})

  if (opt.headers) req.set(opt.headers)
  if (opt.query) req.query(opt.query)
  if (opt.withCredentials) req.withCredentials()

  req.end()

  const source = getEventSource(opt)

  source.addEventListener('sutro', function (event) {
    const data = JSON.parse(event.data)
    const handler = typeHandler[data.type]

    if (!handler) throw new Error('Event type', data.type, 'not recognized')
    if (data.tailId !== tailId) return

    handleMessage(opt, dispatch, handler, data.data)
  })
}
