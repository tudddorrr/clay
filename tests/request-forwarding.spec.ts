import Koa from 'koa'
import supertest from 'supertest'
import { Request, Response, service, Service, forwardRequest, ForwardTo, ClayDocs, Route } from '../lib'

describe('Request forwarding', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should correctly forward a request', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET'
      })
      async index(): Promise<Response> {
        return { status: 200 }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET'
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req)
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService()))
    app.use(service('/generic', new GenericService()))

    await supertest(app.callback())
      .get('/generic')
      .expect(204)
  })

  it('should copy the documentation from the forwarded-to service', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The description',
          params: {
            query: {
            specificityLevel: 'How specific does it need to be?'
            }
          }
        }
      })
      async index(): Promise<Response> {
        return {
          status: 200,
          body: globalThis.clay.docs.services.find((service) => service.name === 'GenericService')
        }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET'
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req)
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService()))
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      description: '',
      name: 'GenericService',
      routes: [
        {
          description: 'The description',
          method: 'GET',
          params: [
            {
              description: 'How specific does it need to be?',
              name: 'specificityLevel',
              required: 'NO',
              type: 'query'
            }
          ],
          path: '/generic',
          samples: []
        }
      ]
    })
  })

  it('should not override the description of the forwarding service', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The specific description'
        }
      })
      async index(): Promise<Response> {
        return {
          status: 200,
          body: globalThis.clay.docs.services.find((service) => service.name === 'GenericService')
        }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The generic description'
        }
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req)
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService()))
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      description: '',
      name: 'GenericService',
      routes: [
        {
          description: 'The generic description',
          method: 'GET',
          params: [],
          path: '/generic',
          samples: []
        }
      ]
    })
  })

  it('should still document forwarded requests to hidden services', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The description',
          params: {
            query: {
            specificityLevel: 'How specific does it need to be?'
            }
          }
        }
      })
      async index(): Promise<Response> {
        return {
          status: 200,
          body: globalThis.clay.docs.services.find((service) => service.name === 'GenericService')
        }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET'
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req)
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService(), { docs: { hidden: true } }))
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      description: '',
      name: 'GenericService',
      routes: [
        {
          description: 'The description',
          method: 'GET',
          params: [
            {
              description: 'How specific does it need to be?',
              name: 'specificityLevel',
              required: 'NO',
              type: 'query'
            }
          ],
          path: '/generic',
          samples: []
        }
      ]
    })
  })

  it('should include the request extra in the forwarded request', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET'
      })
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            specificityLevel: req.query.specificityLevel
          }
        }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET'
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req, {
          query: {
            specificityLevel: 'specific'
          }
        })
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService()))
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      specificityLevel: 'specific'
    })
  })

  it('should not copy the documentation from the forwarded-to service if the route already has documentation ', async () => {
    class SpecificService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The description',
          params: {
            query: {
              specificityLevel: 'How specific does it need to be?',
              requestSource: 'The source of the request'
            }
          }
        }
      })
      async index(): Promise<Response> {
        return {
          status: 200,
          body: globalThis.clay.docs.services.find((service) => service.name === 'GenericService')
        }
      }
    }
  
    class GenericService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'The description',
          params: {
            query: {
              specificityLevel: 'How specific does it need to be?'
            }
          }
        }
      })
      @ForwardTo('specific', 'index')
      async index(req: Request): Promise<Response> {
        return await forwardRequest(req, { query: { requestSource: 'GenericService' } })
      }
    }

    const app = new Koa()
    app.use(service('/specific', new SpecificService()))
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      description: '',
      name: 'GenericService',
      routes: [
        {
          description: 'The description',
          method: 'GET',
          params: [
            {
              description: 'How specific does it need to be?',
              name: 'specificityLevel',
              required: 'NO',
              type: 'query'
            }
          ],
          path: '/generic',
          samples: []
        }
      ]
    })
  })
})
