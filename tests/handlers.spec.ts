import chai from 'chai'
import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, Routes, service, Service } from '../lib'
const expect = chai.expect

describe('Handler functions', () => {
  it('should handle a route handler defined as an anonymous function', async () => {
    @Routes([
      {
        method: 'GET',
        path: '/:id',
        handler: () => async (req: Request): Promise<Response> => {
          return {
            status: 200,
            body: {
              album: {
                id: Number(req.params.id)
              }
            }
          }
        }
      }
    ])
    class AlbumService implements Service {}

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    const res = await supertest(app.callback())
      .get('/albums/1')
      .expect(200)

    expect(res.body).to.eql({
      album: {
        id: 1
      }
    })
  })
  
  it('should handle a route handler that calls a function from the service', async () => {
    @Routes([
      {
        method: 'GET',
        path: '/:id',
        handler: (service: AlbumService) => async (req: Request): Promise<Response> => {
          return await service.getAlbum(req)
        }
      }
    ])
    class AlbumService implements Service {
      async getAlbum(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            album: {
              id: Number(req.params.id)
            }
          }
        }
      }
    }

    const app = new Koa()
    app.use(service('/albums', new AlbumService()))

    const res = await supertest(app.callback())
      .get('/albums/1')
      .expect(200)

    expect(res.body).to.eql({
      album: {
        id: 1
      }
    })
  })
})
