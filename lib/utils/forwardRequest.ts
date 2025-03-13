import { Response, Request, Service, RouteHandler, DefaultBody } from '../service'
import { merge } from 'lodash'

type ForwardHandler<T extends Service> = {
  service: T,
  handler: keyof T
}

export async function forwardRequest<K>(req: Request, reqExtra: Partial<Request> = {}): Promise<Response<K>> {
  const { service, handler } = req.ctx.state.forwardHandler as ForwardHandler<Service>
  const handlerFn = service[handler] as unknown as RouteHandler<DefaultBody, K>
  return handlerFn.apply(service, [merge(req, reqExtra)])
}
