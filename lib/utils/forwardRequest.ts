import { Response, Request, RouteHandler } from '../service'

export async function forwardRequest(req: Request, reqExtra: Partial<Request> = {}): Promise<Response> {
  const handler: RouteHandler = req.ctx.state.forwardHandler
  return await handler({ ...req, ...reqExtra })
}
