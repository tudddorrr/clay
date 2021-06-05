import { Service, ServiceRequest, ServiceResponse } from '../../../lib'

export default class MetaService implements Service {
  async index(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        services: req.ctx.services
      }
    }
  }
}
