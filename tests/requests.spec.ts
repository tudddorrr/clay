import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, Route, Routes, Service, service } from '../lib'

describe('Request parsing', () => {
  it('should correctly parse a query param', async () => {
    class AlbumService extends Service {
      @Route({
        method: 'GET'
      })
      async index(req: Request): Promise<Response> {
        expect(req.query.count).to.equal('2')

        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    await supertest(app.callback())
      .get('/albums?count=2')
      .expect(204)
  })

  it('should correctly parse many query params', async () => {
    class AlbumService extends Service {
      @Route({
        method: 'GET'
      })
      async index(req: Request): Promise<Response> {
        expect(req.query.count).to.equal('2')
        expect(req.query.search).to.equal('never')

        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    await supertest(app.callback())
      .get('/albums?count=2&search=never')
      .expect(204)
  })

  it('should correctly parse a route param', async () => {
    class AlbumService extends Service {
      @Route({
        method: 'GET',
        path: '/:id'
      })
      async get(req: Request): Promise<Response> {
        expect(req.params.id).to.equal('1')

        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    await supertest(app.callback())
      .get('/albums/1')
      .expect(204)
  })

  it('should correctly parse many route params', async () => {
    class AlbumService extends Service {
      @Route({
        method: 'GET',
        path: '/:id/personnel/:personnelId'
      })
      async get(req: Request): Promise<Response> {
        expect(req.params.id).to.equal('1')
        expect(req.params.personnelId).to.equal('3')

        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    await supertest(app.callback())
      .get('/albums/1/personnel/3')
      .expect(204)
  })
})
