import aws from 'aws-sdk'
import bookshelf from '../bookshelf'
import config from '../../config'
import Promise from 'bluebird'
import uuid from 'uuid'
import moment from 'moment'

const JWTGenerator = require('jwt-generator')
const jwtGenerator = new JWTGenerator({
  loginUrl: config.loginUrl,
  privateKey: config.privateKey,
  useRetry: false,
  issuer: 'urn:home-automation/camera'
})
const {publish} = require('home-automation-pubnub').Publisher

const verbose = require('debug')('ha:db:models:file:verbose')

aws.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
})

const s3 = Promise.promisifyAll(new aws.S3())

export default bookshelf.Model.extend({
  tableName: 'files',
  hasTimestamps: true,
  hidden: ['bucket', 'key'],

  initialize () {
    this.on('creating', model => {
      const bucket = config.aws.bucketName
      const key = `${model.get('group_id')}_${model.get('name')}_${uuid.v4().replace(/-/g, '')}`

      // Documentation: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
      return s3.uploadAsync({
        Bucket: bucket,
        Key: key,
        ServerSideEncryption: 'AES256',
        Body: model.get('read_stream')
      })
        .then(() => {
          model.set('bucket', bucket)
          model.set('key', key)
          delete model.attributes.read_stream
        })
    })
    this.on('created', (model, attrs, options) => {
      verbose('sending message to client. group_id:', options.by.group_id)

      const {id, group_id} = options.by // eslint-disable-line camelcase
      return Promise
        .all([
          jwtGenerator.makeToken({
            subject: `File created for group ${options.by.group_id}`,
            audience: 'urn:home-automation/*',
            payload: {id, group_id}
          }),
          model.setDownloadUrl(options)
        ])
        .spread((token) => {
          return publish({
            groupId: options.by.group_id,
            isTrusted: true,
            system: 'CAMERAS',
            type: 'FILE_CREATED',
            payload: model.toJSON(),
            token,
            uuid: 'camera-api'
          })
        })
    })
  },

  setDownloadUrl (options) {
    const exp = options.by.decoded.exp
    const expires = moment.unix(exp).diff(moment(), 'seconds')
    const params = {
      Bucket: this.get('bucket'),
      Key: this.get('key'),
      Expires: expires
    }

    const self = this
    return s3
      .getSignedUrlAsync('getObject', params)
      .then(url => {
        self.set('downloadUrl', url)
      })
      .return(this)
  }
})
