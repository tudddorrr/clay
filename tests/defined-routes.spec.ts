import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, Route, service, Service } from '../lib'

describe('Defined routes', () => {
  it('should handle a defined POST route', async () => {
    class DemoService extends Service {
      @Route({
        method: 'POST'
      })
      async post(req: Request<{ name: string}>): Promise<Response> {
        const { name: _ } = req.body
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/demo', new DemoService()))

    await supertest(app.callback())
      .post('/demo')
      .expect(204)
  })
  
  it('should handle a defined index GET route', async () => {
    class DemoService extends Service {
      @Route({
        method: 'GET',
      })
      async getMany(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/demo', new DemoService()))

    await supertest(app.callback())
      .get('/demo')
      .expect(204)
  })

  it('should handle a defined single GET route', async () => {
    class DemoService extends Service {
      @Route({
        method: 'GET',
        path: '/:id'
      })
      async getOne(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/demo', new DemoService()))

    await supertest(app.callback())
      .get('/demo/1')
      .expect(204)
  })

  it('should not handle an undefined route method', async () => {
    class DemoService extends Service {
      async delete(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/demo', new DemoService()))

    await supertest(app.callback())
      .delete('/demo')
      .expect(404)
  })
})
