import { Router } from 'express'
import Promise from 'bluebird'

const {publish} = require('home-automation-pubnub').Publisher

const verbose = require('debug')('ha:routes:home:verbose')

const router = new Router()

router.post('/take', (req, res) => {
  const options = {by: req.client}
  const params = {
    count: req.body.count || 1,
    duration: req.body.duration || 0 // ISO 8601 ex:
  }

  verbose('sending message to client. group_id:', options.by.group_id)

  return Promise
    .all([
      publish({
        groupId: options.by.group_id,
        isTrusted: true,
        system: 'CAMERAS',
        type: 'TAKE_PHOTO',
        payload: params,
        token: options.by.token,
        uuid: 'camera-api'
      }),
      publish({
        groupId: options.by.group_id,
        isTrusted: false,
        system: 'CAMERAS',
        type: 'TAKE_PHOTO',
        payload: params,
        token: options.by.token,
        uuid: 'camera-api'
      })
    ])
    .then(res.sendStatus.bind(res, 204))
})

export default router
