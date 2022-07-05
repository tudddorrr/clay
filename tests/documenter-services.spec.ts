import chai from 'chai'
import Koa from 'koa'
import { beforeEach } from 'mocha'
import supertest from 'supertest'
import { ClayDocs, Request, Response, service, Service } from '../lib'
const expect = chai.expect

describe('Service documentation', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should set a description on the service', async () => {
    class DocService extends Service {
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }
    }

    const app = new Koa()
    app.use(service('/docs', new DocService(), {
      docs: {
        description: 'The documentation service'
      }
    }))

    const res = await supertest(app.callback())
      .get('/docs')
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: [
          {
            description: 'The documentation service',
            name: 'DocService',
            routes: [
              {
                description: '',
                method: 'GET',
                params: [],
                path: '/docs',
                samples: []
              }
            ]
          }
        ]
      }
    })
  })

  it('should hide services', async () => {
    class DocService extends Service {
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }
    }

    const app = new Koa()
    app.use(service('/docs', new DocService(), {
      docs: {
        hidden: true
      }
    }))

    const res = await supertest(app.callback())
      .get('/docs')
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: []
      }
    })
  })
})
