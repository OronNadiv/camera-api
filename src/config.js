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

config.aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.AWS_BUCKET_NAME
}

if (!config.aws.accessKeyId) {
  error(
    'AWS access key id could not be found in the environment variable.  Please set \'AWS_ACCESS_KEY_ID\'.'
  )
  process.exit(1)
}

if (!config.aws.secretAccessKey) {
  error(
    'AWS secret access key could not be found in the environment variable.  Please set \'AWS_SECRET_ACCESS_KEY\'.'
  )
  process.exit(1)
}

if (!config.aws.bucketName) {
  error(
    'AWS bucket name could not be found in the environment variable.  Please set \'AWS_BUCKET_NAME\'.'
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

config.postgres = process.env.DATABASE_URL || 'postgres://postgres:@localhost/home_automation'
config.postgresPool = {
  min: parseInt(process.env.POSTGRESPOOLMIN || 2, 10),
  max: parseInt(process.env.POSTGRESPOOLMAX || 10, 10),
  log: process.env.POSTGRESPOOLLOG === 'true',
  afterCreate: (connection, cb) => connection.query(`SET SESSION SCHEMA 'camera';`, cb)
}
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
