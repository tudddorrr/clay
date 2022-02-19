import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, Routes, service, Service } from '../lib'

describe('Defined routes', () => {
  it('should handle a defined POST route', async () => {
    @Routes([
      {
        method: 'POST'
      }
    ])
    class DemoService implements Service {
      async post(req: Request): Promise<Response> {
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
    @Routes([
      {
        method: 'GET',
        handler: 'getMany'
      }
    ])
    class DemoService implements Service {
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
    @Routes([
      {
        method: 'GET',
        path: '/:id',
        handler: 'getOne'
      }
    ])
    class DemoService implements Service {
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

  it('should use the correct default path for the method if no path is specified', async () => {
    @Routes([
      {
        method: 'DELETE'
      }
    ])
    class DemoService implements Service {
      async delete(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/demo', new DemoService()))

    await supertest(app.callback())
      .delete('/demo/1')
      .expect(204)
  })

  it('should not handle an undefined route method', async () => {
    @Routes([
      {
        method: 'GET'
      }
    ])
    class DemoService implements Service {
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
