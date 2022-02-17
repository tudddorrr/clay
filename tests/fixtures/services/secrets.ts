import { HasPermission, Service, Policy, Request, Response, PolicyDenial, PolicyResponse, Validate } from '../../../lib'

class SecretsPolicy extends Policy {
  async index(req: Request): Promise<boolean> {
    return req.query.scope === 'get'
  }

  async post(req: Request): Promise<boolean> {
    return this.ctx.headers.key === 'abc123'
  }

  async put(req: Request): Promise<PolicyResponse> {
    return new PolicyDenial({ message: 'Method not implemented yet. Come back later' }, 405)
  }
}

export default class SecretsService implements Service {
  @HasPermission(SecretsPolicy, 'index')
  async index(req: Request): Promise<Response> {
    return {
      status: 204
    }
  }

  @Validate({
    headers: ['key']
  })
  @HasPermission(SecretsPolicy, 'post')
  async post(req: Request): Promise<Response> {
    return {
      status: 204
    }
  }

  @HasPermission(SecretsPolicy, 'put')
  async put(req: Request): Promise<Response> {
    return {
      status: 204
    }
  }
}
