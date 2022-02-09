import { Service, Request, Response } from '../../../lib'

export default class MetaService implements Service {
  async index(req: Request): Promise<Response> {
    return {
      status: 200,
      body: {
        services: req.ctx.services
      }
    }
  }
}
