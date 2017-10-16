import fs from 'fs'
import path from 'path'

const error = require('debug')('ha:config:error')

const config = {production: process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'PRODUCTION'}

config.authPublicKey = process.env.AUTH_PUBLIC_KEY || (config.production ? null : fs.readFileSync(path.join(__dirname, '../test/keys/public_key.pem')))
if (!config.authPublicKey) {
  error(
    'Login public key could not be found in the environment variable.  Please set \'AUTH_PUBLIC_KEY\'.'
  )
  process.exit(1)
}

config.loginUrl = process.env.LOGIN_URL || (config.production ? null : 'http://localhost:3001')
if (!config.loginUrl) {
  error(
    'Login URL could not be found in the environment variable.  Please set \'LOGIN_URL\'.'
  )
  process.exit(1)
}

config.port = process.env.PORT || 3007

config.privateKey = process.env.PRIVATE_KEY || (config.production ? null : fs.readFileSync(path.join(__dirname, '../test/keys/private_key.pem')))
if (!config.privateKey) {
  error(
    'Private key could not be found in the environment variable.  Please set \'PRIVATE_KEY\'.'
  )
  process.exit(1)
}

config.skipSSL = process.env.SKIP_SSL && process.env.SKIP_SSL.toUpperCase() === 'TRUE'

config.uiUrl = process.env.UI_URL || 'http://localhost:3000'
if (!config.uiUrl) {
  error(
    'UI URL could not be found in the environment variable.  Please set \'UI_URL\'.'
  )
  process.exit(1)
}

export default config
