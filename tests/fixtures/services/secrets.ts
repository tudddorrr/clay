import { HasPermission, HookParams, Service, Policy, Request, Response, Before, PolicyDenial, PolicyResponse } from '../../../lib'

class SecretsPolicy extends Policy {
  async index(req: Request): Promise<boolean> {
    return req.query.scope === 'get'
  }

  async post(req: Request): Promise<boolean> {
    return this.ctx.state.key === 'abc123'
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

  @Before((hook: HookParams) => hook.req.ctx.state.key = hook.req.body.key)
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
