import { Context } from 'koa'
import { RouteDocs } from './documenter'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Route {
  method: HttpMethod
  path?: string
  handler?: string | Function
  docs?: RouteDocs
}

export type Request = {
  readonly ctx: Context
  readonly headers: { readonly [key: string]: string }
  readonly path: string
  readonly query?: { readonly [key: string]: string }
  readonly params?: { readonly [key: string]: string }
  readonly body?: { readonly [key: string]: any }
}

export type Response = {
  readonly status: number
  readonly body?: {
    readonly [key: string]: any
  }
}

export type RedirectStatus = 300 | 301 | 302 | 303 | 304 | 307 | 308

export type RedirectResponse = {
  readonly status: RedirectStatus
  readonly url: string
}

export type RouteHandler = (req: Request) => Promise<Response | RedirectResponse>

export class Service {
  attached: boolean

  routes: Route[]
  definedRoutes: Route[]

  setRoutes(routes: Route[]) {
    this.routes = routes
    this.attached = true
  }

  async index(req: Request): Promise<Response> {
    return { status: 405 }
  }

  async get(req: Request): Promise<Response> {
    return { status: 405 }
  }

  async post(req: Request): Promise<Response> {
    return { status: 405 }
  }

  async put(req: Request): Promise<Response> {
    return { status: 405 }
  }

  async patch(req: Request): Promise<Response> {
    return { status: 405 }
  }

  async delete(req: Request): Promise<Response> {
    return { status: 405 }
  }
}
