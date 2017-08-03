import diehard from 'diehard'
import expressInitializer from './initializations/express'
import Promise from 'bluebird'

Promise
  .try(expressInitializer.initialize)
  .then(() => diehard.listen({timeout: 5000}))
