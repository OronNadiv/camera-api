import Factory from '../factory'
import Promise from 'bluebird'
import Request from './request'
import should from 'should'
import UserFixture from '../fixtures/user'

const factory = Factory()
const shared = {}
const userFixture = new UserFixture()

let context

describe('Files route', () => {
  before(() => {
    return Promise
      .resolve(userFixture.create('user'))
      .then((res) => {
        context = res
        return Request
      })
      .then(req => {
        context.request = req
      })
  })

  after(() => {
    return factory.cleanup()
  })

  it('/login + http should get 302 to https', () => {
    return context.request
      .get('/')
      .set('Accept', 'application/json')
      .send()
      .expect(302)
      .then(res => {
        res.headers.location.should.startWith('https://')
      })
  })

  it('/login +https -token should get 200', () => {
    return context.request
      .get('/')
      .set('Accept', 'application/json')
      .set('x-forwarded-proto', 'https')
      .send()
      .expect(200)
      .then(res => {
        should.not.exist(res.headers.location)
      })
  })

  it('/login -https +token should get 302 to https', () => {
    return context.request
      .get('/')
      .set('Accept', 'application/json')
      .set('authorization', shared.token)
      .send()
      .expect(302)
      .then(res => {
        res.headers.location.should.startWith('https://')
      })
  })

  it('/login +https +token should get 200', () => {
    return context.request
      .get('/')
      .set('Accept', 'application/json')
      .set('authorization', shared.token)
      .set('x-forwarded-proto', 'https')
      .send()
      .expect(200)
      .then(res => {
        should.not.exist(res.headers.location)
      })
  })
})
