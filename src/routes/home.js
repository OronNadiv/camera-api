import { Router } from 'express'
import Promise from 'bluebird'
import config from '../config'
import JWTGenerator from 'jwt-generator'

const {publish} = require('home-automation-pubnub').Publisher

const verbose = require('debug')('ha:routes:home:verbose')

const router = new Router()

const jwtGenerator = new JWTGenerator({
  loginUrl: config.loginUrl,
  privateKey: config.privateKey,
  useRetry: false,
  issuer: 'urn:home-automation/garage'
})

router.post('/take', (req, res) => {
  const options = {by: req.client}
  const params = {
    count: req.body.count || 1,
    duration: req.body.duration || 0 // ISO 8601 ex:
  }

  verbose('sending message to client. group_id:', options.by.group_id)

  return Promise
    .resolve(jwtGenerator.makeToken({
      subject: `Requesting camera to take photo. ${options.by.group_id}`,
      audience: 'urn:home-automation/camera',
      payload: options.by
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
})

export default router
