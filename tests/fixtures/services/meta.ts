import { Service, ServiceRequest, ServiceResponse } from '../../../lib'

export default class MetaService implements Service {
  async get(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        services: req.ctx.services
      }
    }
  }
}
