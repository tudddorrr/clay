import { HasPermission, HookParams, Service, ServicePolicy, ServiceRequest, ServiceResponse, Before, ServicePolicyDenial } from '../../../lib'

class SecretsServicePolicy extends ServicePolicy {
  async index(req: ServiceRequest): Promise<boolean> {
    return req.query.scope === 'get'
  }

  async post(req: ServiceRequest): Promise<boolean> {
    return this.ctx.state.key === 'abc123'
  }

  async put(req: ServiceRequest): Promise<boolean | ServicePolicyDenial> {
    return new ServicePolicyDenial({ message: 'Method not implemented yet. Come back later' }, 405)
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

  @HasPermission(SecretsServicePolicy, 'put')
  async put(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
