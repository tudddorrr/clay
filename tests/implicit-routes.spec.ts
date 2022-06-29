import chai from 'chai'
import Koa from 'koa'
import supertest from 'supertest'
import bodyParser from 'koa-bodyparser'
import { Request, Response, Service, service } from '../lib'
const expect = chai.expect

describe('Implicit routes', () => {
  it('should handle an implicit POST route', async () => {
    class UserService extends Service {
      async post(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            user: {
              id: req.body.id
            }
          }
        }
      }
    }

    const app = new Koa()
    app.use(bodyParser())
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .post('/users')
      .send({ id: 1 })
      .expect(200)

    expect(res.body.user).to.have.key('id')
  })

  it('should handle an implicit index GET route', async () => {
    class UserService extends Service {
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            users: []
          }
        }
      }
    }

    const app = new Koa()
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .get('/users')
      .expect(200)

    expect(res.body.users).to.eql([])
  })

  it('should handle an implicit single GET route', async () => {
    class UserService extends Service {
      async get(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            user: {
              id: req.params.id
            }
          }
        }
      }
    }

    const app = new Koa()
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .get('/users/1')
      .expect(200)

    expect(res.body.user).to.have.key('id')
  })
})
