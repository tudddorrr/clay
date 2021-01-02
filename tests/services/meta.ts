import { Service, ServiceRequest, ServiceResponse } from '../../lib'

export default class MetaService implements Service<any> {
  async get(req?: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        services: req.ctx.state.services
      }
    }
  }
}
