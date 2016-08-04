const path = require('path')
const LOG_PREFIX = `"${path.basename(__filename)}":`
const log = require('../logger')
const verbose = log.verbose.bind(log, LOG_PREFIX)

import {createClient} from 'redis'
import {Router} from 'express'
import config from '../config'
import emitter from 'socket.io-emitter'
import Promise from 'bluebird'

const router = new Router()

router.post('/take', (req, res) => {
  const options = {by: req.client}
  const client = createClient(config.redisUrl)
  const params = {
    count: req.body.count || 1,
    duration: req.body.duration || 0 // ISO 8601 ex:
  }

  return Promise
    .try(() => {
      verbose('sending message to client. group_id:', options.by.group_id)

      const io = emitter(client)
      io.of(`/${options.by.group_id}`).to('cameras').emit('TAKE_PHOTO', params)
    })
    .then(res.sendStatus.bind(res, 204))
    .finally(() => {
      if (client) {
        client.quit()
      }
    })
})

export default router
