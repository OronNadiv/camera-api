import jwt from 'jsonwebtoken'
import config from '../config'

const info = require('debug')('ha:middleware:auth_token:info')

export default (req, res, next) => {
  function sendUnauthenticated () {
    info('Sending unauthorized - 401.')
    return res.sendStatus(401)
  }

  let token

  if (req.headers.authorization) {
    const matched = req.headers.authorization.match(/Bearer (.+)/)
    if (matched.length > 1) {
      token = matched[1]
    }
  }

  if (!token || !token.length) {
    info('Token cannot be found. Url: ', req.url)
    return sendUnauthenticated()
  }

  jwt.verify(token, config.authPublicKey, (err, payload) => {
    if (err) {
      info('Issue while verifying token. Url: ', req.url)
      return sendUnauthenticated()
    }

    // token is valid

    const decoded = jwt.decode(token)
    req.client = payload
    req.client.token = token
    req.client.decoded = decoded
    return next()
  })
}
