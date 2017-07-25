import diehard from 'diehard'
import domain from 'domain'
import expressInitializer from './initializations/express'
import Promise from 'bluebird'

const error = require('debug')('ha:app:error')

const d = domain.create()

d.on('error', error)

d.run(() => {
  Promise
    .try(expressInitializer.initialize)
    .then(() => diehard.listen({timeout: 5000}))
})
