import { Router } from 'express'
import Promise from 'bluebird'
import config from '../config'
import JWTGenerator from 'jwt-generator'
import DebugLib from 'debug'

const {publish} = require('home-automation-pubnub').Publisher

const verbose = DebugLib('ha:routes:home:verbose')
const error = DebugLib('ha:routes:home:error')

const router = new Router()

const jwtGenerator = new JWTGenerator({
  loginUrl: config.loginUrl,
  privateKey: config.privateKey,
  useRetry: false,
  issuer: 'urn:home-automation/camera'
})

router.post('/take', (req, res) => {
  const options = {by: req.client}
  const params = {
    count: req.body.count || 1,
    duration: req.body.duration || 0 // ISO 8601 ex:
  }

  verbose('sending message to client. group_id:', options.by.group_id)

  const {id, group_id} = options.by
  return Promise
    .resolve(jwtGenerator.makeToken({
      subject: `Requesting camera to take photo. ${options.by.group_id}`,
      audience: 'urn:home-automation/*',
      payload: {id, group_id}
    }))
    .then((token) => {
      return Promise.all([
        publish({
          groupId: options.by.group_id,
          isTrusted: true,
          system: 'CAMERAS',
          type: 'TAKE_PHOTO',
          payload: params,
          token,
          uuid: 'camera-api'
        }),
        publish({
          groupId: options.by.group_id,
          isTrusted: false,
          system: 'CAMERAS',
          type: 'TAKE_PHOTO',
          payload: params,
          token,
          uuid: 'camera-api'
        })
      ])
    })
    .then(() => {
      return res.sendStatus(204)
    })
    .catch((err) => {
      error('Error while trying to publish "take photo" event.  Returning 500.', 'err:', err)
      return res.sendStatus(500)
    })
})

export default router
