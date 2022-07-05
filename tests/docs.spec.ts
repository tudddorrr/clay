import chai from 'chai'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { beforeEach } from 'mocha'
import supertest from 'supertest'
import { ClayDocs, Docs, Request, Response, service, Service, Validate } from '../lib'
const expect = chai.expect

describe('@Docs decorator', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should set a description on the route', async () => {
    class UserService extends Service {
      @Docs({
        description: 'Get all users'
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
                path: '/users'
              }
            ]
          }
        ]
      }
    })
  })

  it('should hide routes', async () => {
    class UserService extends Service {
      @Docs({
        hidden: true
      })
      async index(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            docs: globalThis.clay.docs
          }
        }
      }

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
                path: '/users'
              }
            ]
          }
        ]
      }
    })
  })

  it('should document parameters', async () => {
    class UserService extends Service {
      @Docs({
        params: {
          query: {
            search: 'An optional search query to find users by name'
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

      @Docs({
        params: {
          route: {
            id: 'The id of the user'
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
                method: 'PUT',
                params: [
                  {
                    type: 'route',
                    required: 'YES',
                    name: 'id',
                    description: 'The id of the user'
                  }
                ],
                path: '/users/:id'
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
                path: '/users'
              }
            ]
          }
        ]
      }
    })
  })

  it('should not override the requiredType of a param previously set through validation', async () => {
    class UserService extends Service {
      @Validate({ body: ['name'] })
      @Docs({
        params: {
          body: {
            name: 'The name of the user'
          }
        }
      })
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
                path: '/users'
              }
            ]
          }
        ]
      }
    })
  })
})
