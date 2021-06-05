import { HasPermission, HookParams, Service, ServicePolicy, ServiceRequest, ServiceResponse, Before } from '../../../lib'

class SecretsServicePolicy extends ServicePolicy {
  async index(req: ServiceRequest): Promise<boolean> {
    return req.query.scope === 'get'
  }

  async post(req: ServiceRequest): Promise<boolean> {
    return this.ctx.state.key === 'abc123'
  }
}

export default class SecretsService implements Service {
  @HasPermission(SecretsServicePolicy, 'index')
  async index(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }

  @Before((hook: HookParams) => hook.req.ctx.state.key = hook.req.body.key)
  @HasPermission(SecretsServicePolicy, 'post')
  async post(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
