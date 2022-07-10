import chai from 'chai'
import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, service, Service } from '../lib'
const expect = chai.expect

describe('Service registration', () => {
  class GenericService extends Service {
    async index(req: Request): Promise<Response> {
      return {
        status: 200,
        body: {
          services: req.ctx.state.services
        }
      }
    }
  }

  it('should correctly register services', async () => {
    const app = new Koa()
    app.use(service('/users', new GenericService()))
    app.use(service('/comments', new GenericService()))
    app.use(service('/albums', new GenericService()))

    const res = await supertest(app.callback()).get('/users')
    expect(res.body.services).to.have.keys(['users', 'comments', 'albums'])
  })

  it('should correctly namespace services', async () => {
    const app = new Koa()
    app.use(service('/api/users', new GenericService()))
    app.use(service('/api/comments', new GenericService()))

    const res = await supertest(app.callback()).get('/api/users')
    expect(res.body.services).to.have.property('api').with.keys(['users', 'comments'])
  })

  it('should correctly namespace nested services', async () => {
    const app = new Koa()
    app.use(service('/api/games/:gameId/users', new GenericService()))
    app.use(service('/api/version/:version/games/:gameId/users', new GenericService()))
    app.use(service('/registered', new GenericService()))

    const res = await supertest(app.callback()).get('/registered')
    expect(res.body.services).to.have.keys(['api', 'registered'])
    expect(res.body.services.api).to.have.keys(['games', 'version'])
  })
})

