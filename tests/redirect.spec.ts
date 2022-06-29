import Koa from 'koa'
import supertest from 'supertest'
import { RedirectResponse, service, Service, redirect } from '../lib'

describe('Redirects', () => {
  class GenericService extends Service {
    async index(): Promise<RedirectResponse> {
      return redirect('/new-location', 308)
    }
  }

  it('should correctly create a redirect', async () => {
    const app = new Koa()
    app.use(service('/users', new GenericService()))

    await supertest(app.callback())
      .get('/users')
      .expect(308)
      .expect('Location', '/new-location')
  })
})
