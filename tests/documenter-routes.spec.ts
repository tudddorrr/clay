import Koa from 'koa'
import supertest from 'supertest'
import { ClayDocs, Request, Response, Route, service, Service } from '../lib'

describe('Route documentation', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should set a description on the route', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        path: '/current',
        docs: {
          description: 'The current user'
        }
      })
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

      @Route({
        method: 'GET',
        docs: {
          description: 'All users'
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
                description: 'The current user',
                method: 'GET',
                params: [],
                path: '/users/current',
                samples: []
              },
              {
                description: 'All users',
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
        path: '/current',
        docs: {
          hidden: true
        }
      })
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

      @Route({
        method: 'GET',
        docs: {
          description: 'All users'
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
                description: 'All users',
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

  it('should document params', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        path: '/current',
        docs: {
          params: {
            headers: {
              authorisation: 'The auth header'
            }
          }
        }
      })
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

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
                    type: 'headers',
                    required: 'NO',
                    name: 'authorisation',
                    description: 'The auth header'
                  }
                ],
                path: '/users/current',
                samples: []
              },
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
              }
            ]
          }
        ]
      }
    })
  })

  it('should correctly document route params', async () => {
    class UserService extends Service {
      @Route({
        method: 'GET',
        path: '/:id',
        docs: {
          params: {
            route: {
              id: 'The ID of the user'
            }
          }
        }
      })
      async get(req: Request): Promise<Response> {
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
      .get('/users/1')
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
                    type: 'route',
                    required: 'YES',
                    name: 'id',
                    description: 'The ID of the user'
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
})
