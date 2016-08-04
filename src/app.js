const path = require('path')
const LOG_PREFIX = `"${path.basename(__filename)}":`
const log = require('./logger')
const error = log.error.bind(log, LOG_PREFIX)

import diehard from 'diehard'
import domain from 'domain'
import expressInitializer from './initializations/express'
import Promise from 'bluebird'

const d = domain.create()

d.on('error', error)

d.run(() => {
  log.level = process.env.LOG_LEVEL || 'info'

  Promise
    .try(expressInitializer.initialize)
    .then(() => diehard.listen({timeout: 5000}))
})
