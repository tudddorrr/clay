import chai from 'chai'
import Koa from 'koa'
import { beforeEach } from 'mocha'
import supertest from 'supertest'
import { ClayDocs, Request, Response, Routes, service, Service } from '../lib'
const expect = chai.expect

describe('Route documentation', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should set a description on the route', async () => {
    @Routes([
      {
        method: 'GET',
        path: '/current',
        handler: 'current',
        docs: {
          description: 'The current user'
        }
      },
      {
        method: 'GET',
        path: '',
        handler: 'index',
        docs: {
          description: 'All users'
        }
      }
    ])
    class UserService extends Service {
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

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
    @Routes([
      {
        method: 'GET',
        path: '/current',
        handler: 'current',
        docs: {
          hidden: true
        }
      },
      {
        method: 'GET',
        path: '',
        handler: 'index',
        docs: {
          description: 'All users'
        }
      }
    ])
    class UserService extends Service {
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

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
    @Routes([
      {
        method: 'GET',
        path: '/current',
        handler: 'current',
        docs: {
          params: {
            headers: {
              authorisation: 'The auth header'
            }
          }
        }
      },
      {
        method: 'GET',
        path: '',
        handler: 'index',
        docs: {
          params: {
            query: {
              search: 'An optional search query to find users by name'
            }
          }
        }
      }
    ])
    class UserService extends Service {
      async current(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }

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
    @Routes([
      {
        method: 'GET',
        path: '/:id',
        handler: 'get',
        docs: {
          params: {
            route: {
              id: 'The ID of the user'
            }
          }
        }
      }
    ])
    class UserService extends Service {
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
