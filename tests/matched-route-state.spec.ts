import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, service, Service, Route } from '../lib'

describe('Matched route state', () => {
  class GenericService extends Service {
    @Route({
      method: 'GET',
      path: '/:id'
    })
    async get(req: Request): Promise<Response> {
      return {
        status: 200,
        body: {
          state: req.ctx.state
        }
      }
    }
  }

  it('should set the matched route', async () => {
    const app = new Koa()
    app.use(service('/state', new GenericService()))

    const res = await supertest(app.callback()).get('/state/1')
    expect(res.body.state.matchedRoute).to.equal('/state/:id')
  })

  it('should set the matched service\'s key', async () => {
    const app = new Koa()
    app.use(service('/stuff/:stuffId/things/:thingsId/state', new GenericService()))

    const res = await supertest(app.callback()).get('/stuff/1/things/2/state/1')
    expect(res.body.state.matchedServiceKey).to.equal('stuff.things.state')
  })
})
