import _ from 'underscore'
import { Router } from 'express'
import File from '../db/models/file'
import fs from 'fs'
import Multipart from 'connect-multiparty'
import Promise from 'bluebird'

const verbose = require('debug')('ha:routes:files:verbose')
const error = require('debug')('ha:routes:files:info')

const multipart = Multipart()
const router = new Router()

router.get('/files', (req, res, next) => {
  if (!req.client.is_trusted) {
    return res.sendStatus(403)
  }

  res.set('Cache-Control', 'no-store, no-cache')
  res.set('Pragma', 'no-cache')

  verbose('GET /files called.')
  const MAX_LIMIT = 10000
  const options = {by: req.client}
  const order = req.query.order && req.query.order === 'asc' ? req.query.order : 'desc'
  const after = req.query.after ? new Date(req.query.after) : null
  const before = req.query.before ? new Date(req.query.before) : null
  let limit = parseInt(req.query.limit || MAX_LIMIT)

  if (limit < 1 || limit > MAX_LIMIT) {
    limit = MAX_LIMIT
  }
  File
    .forge()
    .query(qb => {
      qb.where('group_id', '=', options.by.group_id)
      qb.where('is_deleted', '=', false)
      if (before) {
        qb.where('created_at', '<=', before)
      }
      if (after) {
        qb.where('created_at', '>=', after)
      }
      qb.orderBy('created_at', order.toUpperCase())
      qb.limit(limit)
    })
    .fetchAll(options)
    .get('models')
    .map(file => {
      return file
        .setDownloadUrl(options)
        .then((file) => file.toJSON())
    })
    .then(files => {
      res.json(files)
    })
    .catch(next)
})

router.post('/files', multipart, (req, res, next) => {
  verbose('POST /files called. req.files: ', req.files)

  let readStream

  if (!req.files) {
    return next('File(s) could not be found.')
  }

  Promise.map(_.values(req.files), file => {
    readStream = fs.createReadStream(file.path)
    readStream.on('close', () => {
      fs.unlink(file.path, err =>
        err
          ? error(`Error while calling unlink.  req.files: ${req.files}, file: ${file}, file.path: ${file.path}, err: ${err}`)
          : verbose(`File deleted successfully.  file.path: ${file.path}`)
      )
    })

    // todo: do it in a transaction.
    return File.forge()
      .save({
        name: file.name,
        type: file.type,
        size: file.size,
        group_id: req.client.group_id,
        read_stream: readStream
      }, {by: req.client})
  })
    .then(res.sendStatus.bind(res, 201))
    .catch(next)
})

export default router
