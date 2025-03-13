import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import supertest from 'supertest'
import { ClayDocs, Request, Response, RouteSample, service, Service, Validate, Route } from '../lib'

describe('@Route decorator docs', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should set a description on the route', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        docs: {
          description: 'Get all users'
        }
      })
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
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .get('/users')
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: [
          {
            description: '',
            name: 'UserService',
            routes: [
              {
                description: 'Get all users',
                method: 'GET',
                params: [],
                path: '/users',
                samples: []
              }
            ]
          }
        ]
      }
    })
  })

  it('should hide routes', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        docs: {
          hidden: true
        }
      })
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }

      @Route({
        method: 'POST'
      })
      async post(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .get('/users')
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: [
          {
            description: '',
            name: 'UserService',
            routes: [
              {
                description: '',
                method: 'POST',
                params: [],
                path: '/users',
                samples: []
              }
            ]
          }
        ]
      }
    })
  })

  it('should document parameters', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        docs: {
          params: {
            query: {
              search: 'An optional search query to find users by name'
            }
          }
        }
      })
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }

      @Route({
        method: 'PUT',
        path: '/:id',
        docs: {
          params: {
            route: {
              id: 'The id of the user'
            }
          }
        }
      })
      async put(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .get('/users')
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: [
          {
            description: '',
            name: 'UserService',
            routes: [
              {
                description: '',
                method: 'GET',
                params: [
                  {
                    type: 'query',
                    required: 'NO',
                    name: 'search',
                    description: 'An optional search query to find users by name'
                  }
                ],
                path: '/users',
                samples: []
              },
              {
                description: '',
                method: 'PUT',
                params: [
                  {
                    type: 'route',
                    required: 'YES',
                    name: 'id',
                    description: 'The id of the user'
                  }
                ],
                path: '/users/:id',
                samples: []
              }
            ]
          }
        ]
      }
    })
  })

  it('should not override the requiredType of a param previously set through validation', async () => {
    class UserService extends Service {
      @Route({
        method: 'POST',
        docs: {
          params: {
            body: {
              name: 'The name of the user'
            }
          }
        }
      })
      @Validate({ body: ['name'] })
      async post(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }
    }

    const app = new Koa()
    app.use(bodyParser())
    app.use(service('/users', new UserService()))

    const res = await supertest(app.callback())
      .post('/users')
      .send({ name: 'Bob' })
      .expect(200)

    expect(res.body).to.eql({
      docs: {
        services: [
          {
            description: '',
            name: 'UserService',
            routes: [
              {
                description: '',
                method: 'POST',
                params: [
                  {
                    type: 'body',
                    required: 'YES',
                    name: 'name',
                    description: 'The name of the user'
                  }
                ],
                path: '/users',
                samples: []
              }
            ]
          }
        ]
      }
    })
  })

  it('should show route samples', async () => {
    const sample: RouteSample = {
      title: 'Sample response',
      sample: {
        id: 1,
        email: 'user@email.com',
        classType: 'User',
        metadata: {
          registeredAt: '2022-01-01 03:39:10'
        }
      }
    }

    class GenericService extends Service {
      @Route({
        method: 'GET',
        docs: {
          samples: [sample]
        }
      })
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: globalThis.clay.docs.services.find((service) => service.name === 'GenericService')
        }
      }
    }

    const app = new Koa()
    app.use(service('/generic', new GenericService()))

    const res = await supertest(app.callback())
      .get('/generic')
      .expect(200)

    expect(res.body).to.eql({
      description: '',
      name: 'GenericService',
      routes: [
        {
          description: '',
          method: 'GET',
          params: [],
          path: '/generic',
          samples: [sample]
        }
      ]
    })
  })
})
