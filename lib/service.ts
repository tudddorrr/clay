import { Context } from 'koa'
import { RouteDocs } from './documenter'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RouteConfig = {
  method: HttpMethod
  path: string
  handler: string
  docs?: RouteDocs
}

export type Routes = RouteConfig[]

export type DefaultBody = Record<string, any>

export type Request<T = DefaultBody> = {
  readonly ctx: Context
  readonly headers: Record<string, string>
  readonly path: string
  readonly query: Record<string, string>
  readonly params: Record<string, string>
  readonly body: T
}

export type Response<T = DefaultBody> = {
  readonly status: number
  readonly body?: T
}

export type RedirectStatus = 300 | 301 | 302 | 303 | 304 | 307 | 308

export type RedirectResponse = {
  readonly status: RedirectStatus
  readonly url: string
}

export type RouteHandler<T = DefaultBody, K = DefaultBody> = (req: Request<T>) => Response<K> | RedirectResponse

export const SERVICE_ROUTES = Symbol("serviceRoutes")
export class Service {
  attached: boolean = false

  constructor() {
    if (!Reflect.has(this, SERVICE_ROUTES)) {
      Reflect.set(this, SERVICE_ROUTES, [])
    }
  }

  get routes(): Routes {
    return Reflect.get(this, SERVICE_ROUTES) as Routes
  }

  set routes(value: Routes) {
    Reflect.set(this, SERVICE_ROUTES, value)
  }
}
