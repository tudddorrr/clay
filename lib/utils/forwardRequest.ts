import { Response, Request, Service } from '../service'
import { merge } from 'lodash'

type ForwardHandler = {
  service: Service,
  handler: string
}

export async function forwardRequest(req: Request, reqExtra: Partial<Request> = {}): Promise<Response> {
  const { service, handler } = req.ctx.state.forwardHandler as ForwardHandler
  return await service[handler].apply(service, [merge(req, reqExtra)])
}
