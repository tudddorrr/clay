import chai from 'chai'
import Koa from 'koa'
import supertest from 'supertest'
import { HasPermission, Policy, PolicyDenial, PolicyResponse, Request, Response, service, Service } from '../lib'
const expect = chai.expect

describe('@HasPermission decorator', () => {
  it('should not return an error if a @HasPermission is met', async () => {
    class SecretPolicy extends Policy {
      async index(req: Request): Promise<PolicyResponse> {
        return req.query.scope === 'get'
      }
    }
    
    class SecretService implements Service {
      @HasPermission(SecretPolicy, 'index')
      async index(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/secrets', new SecretService()))

    await supertest(app.callback())
      .get('/secrets?scope=get')
      .expect(204)
  })

  it('should return a 403 if a @HasPermission is not met', async () => {    
    class SecretPolicy extends Policy {
      async index(req: Request): Promise<PolicyResponse> {
        return req.query.scope === 'get'
      }
    }
    
    class SecretService implements Service {
      @HasPermission(SecretPolicy, 'index')
      async index(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/secrets', new SecretService()))

    await supertest(app.callback())
      .get('/secrets?scope=everything')
      .expect(403)
  })

  it('should be able to access Koa context in an @HasPermission policy', async () => {    
    class SecretPolicy extends Policy {
      async index(req: Request): Promise<PolicyResponse> {
        return this.ctx.headers.key === 'p@ssw0rd'
      }
    }
    
    class SecretService implements Service {
      @HasPermission(SecretPolicy, 'index')
      async index(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/secrets', new SecretService()))

    await supertest(app.callback())
      .get('/secrets')
      .set('key', 'p@ssw0rd')
      .expect(204)
  })

  it('should merge in data from PolicyDenials and use the correct status code', async () => {    
    class SecretPolicy extends Policy {
      async index(req: Request): Promise<PolicyResponse> {
        return new PolicyDenial({ message: 'Method not implemented yet. Come back later' }, 405)
      }
    }
    
    class SecretService implements Service {
      @HasPermission(SecretPolicy, 'index')
      async index(req: Request): Promise<Response> {
        return {
          status: 204
        }
      }
    }

    const app = new Koa()
    app.use(service('/secrets', new SecretService()))

    const res = await supertest(app.callback())
      .get('/secrets')
      .expect(405)

    expect(res.text).to.equal('Method not implemented yet. Come back later')
  })
})
