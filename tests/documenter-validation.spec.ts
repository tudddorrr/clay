import chai from 'chai'
import Koa from 'koa'
import { beforeEach } from 'mocha'
import supertest from 'supertest'
import { ClayDocs, Request, Required, Response, service, Service, Validate } from '../lib'
const expect = chai.expect

describe('Validation documentation', () => {
  beforeEach(() => {
    globalThis.clay.docs = new ClayDocs()
  })

  it('should document params from an array validation schema', async () => {
    class UserService extends Service {
      @Validate({
        body: ['name', 'password'],
        query: ['organisationId']
      })
      async post(req: Request): Promise<Response> {
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

    expect(res.body.docs.services[0].routes).to.eql([
      {
        description: '',
        method: 'POST',
        path: '/users',
        params: [
          {
            name: 'organisationId',
            required: 'YES',
            type: 'query',
            description: ''
          },
          {
            name: 'name',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'password',
            required: 'YES',
            type: 'body',
            description: ''
          }
        ]
      },
      {
        description: '',
        method: 'GET',
        path: '/users',
        params: []
      }
    ])
  })

  it('should document entity requirements', async () => {
    class User {
      @Required()
      name: string

      @Required()
      password: string

      @Required({ as: 'organisationId' })
      organisation: {}

      @Required({ requiredIf: async () => true })
      subscriptionStatus: number
    }

    class UserService extends Service {
      @Validate({
        body: [User]
      })
      async post(req: Request): Promise<Response> {
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

    expect(res.body.docs.services[0].routes).to.eql([
      {
        description: '',
        method: 'POST',
        path: '/users',
        params: [
          {
            name: 'name',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'password',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'organisationId',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'subscriptionStatus',
            required: 'SOMETIMES',
            type: 'body',
            description: ''
          }
        ]
      },
      {
        description: '',
        method: 'GET',
        path: '/users',
        params: []
      }
    ])
  })

  it('should document params from an object validation schema', async () => {
    class UserService extends Service {
      @Validate({
        body: {
          name: {
            required: true
          },
          password: {
            required: true
          },
          organisationId: {
            required: false
          },
          subscriptionStatus: {
            requiredIf: async () => true
          }
        }
      })
      async post(req: Request): Promise<Response> {
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

    expect(res.body.docs.services[0].routes).to.eql([
      {
        description: '',
        method: 'POST',
        path: '/users',
        params: [
          {
            name: 'name',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'password',
            required: 'YES',
            type: 'body',
            description: ''
          },
          {
            name: 'organisationId',
            required: 'NO',
            type: 'body',
            description: ''
          },
          {
            name: 'subscriptionStatus',
            required: 'SOMETIMES',
            type: 'body',
            description: ''
          }
        ]
      },
      {
        description: '',
        method: 'GET',
        path: '/users',
        params: []
      }
    ])
  })
})
