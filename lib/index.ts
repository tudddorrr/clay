import { pathToRegexp } from 'path-to-regexp'
import { Context } from 'koa'

export interface ServiceRequest {
  ctx: Context
  headers: { [key: string]: any }
  path: { [key: string]: string }
  query?: { [key: string]: any }
  params?: { [key: string]: string }
  body?: { [key: string]: any }
}

export interface ServiceResponse {
  status: number
  body?: {
    [key: string]: any
  }
}

export interface Service<T> {
  [key: string]: any

  // todo HEAD, OPTIONS

  get? (req?: ServiceRequest): Promise<ServiceResponse>

  post? (req?: ServiceRequest): Promise<ServiceResponse>

  put? (req?: ServiceRequest): Promise<ServiceResponse>

  patch? (req?: ServiceRequest): Promise<ServiceResponse>

  delete? (req?: ServiceRequest): Promise<ServiceResponse>
}

export interface HookParams {
  args: Array<any>
  result?: ServiceResponse
  caller: any
}

export interface ServiceRoute {
  method: string
  path?: string
  handler?: string | Function
}

export interface ServiceOpts {
  basePath?: string
  routes?: ServiceRoute[]
}

const attachService = (ctx: Context, name: string, service: Service<any>): void => {
  if (ctx.state.services?.[name] === undefined) {
    ctx.state.services = {
      ...ctx.state.services,
      [name]: service
    }
  }
}

const buildParams = (ctx: Context, path: string): any => {
  const routeUrlData = path.split('/')
  const reqUrlData = ctx.path.split('/')

  return routeUrlData.reduce((acc, cur, idx) => {
    if (cur.startsWith(':')) return { ...acc, [cur.substring(1)]: reqUrlData[idx] }
    return acc
  }, {})
}

const buildDefaultRoutes = (basePath: string, service: Service<any>): ServiceRoute[] => {
  const routes: ServiceRoute[] = []
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const noIdRequiredMethods = ['GET', 'POST']

  methods.forEach((method) => {
    if (service[method.toLowerCase()]) {
      routes.push({
        method,
        path: `${basePath}${noIdRequiredMethods.includes(method) ? '' : '/:id'}`
      })
    }
  })
  
  routes.push({
    method: 'GET',
    path: `${basePath}/:id`
  })

  return routes
}

const getRouteHandler = (service: Service<any>, route: ServiceRoute): Function => {
  if (typeof route.handler === 'string') {
    return service[route.handler]
  } else if (typeof route.handler === 'function') {
    const handlerFunc = <Function>route.handler
    return handlerFunc(service)
  } else {
    return service[route.method.toLowerCase()]
  }
}

export function service(name: string, service: Service<any>, opts: ServiceOpts = {}) {
  const basePath = opts.basePath ?? ''
  const routes = opts.routes?.map((route) => ({
    ...route,
    path: basePath + route.path
  })) ?? buildDefaultRoutes(basePath, service)
  
  return async (ctx, next) => {
    attachService(ctx, name, service)

    const route = routes.find((r) => r.method === ctx.method && pathToRegexp(r.path).test(ctx.path))
    if (!route) return next()

    const handler = getRouteHandler(service, route)
    if (!handler) return next()

    const data: ServiceRequest = {
      ctx,
      query: ctx.query,
      path: ctx.path,
      headers: ctx.headers,
      params: buildParams(ctx, route.path),
      body: ctx.request.body
    }

    let res: ServiceResponse = null
    res = await handler.apply(service, [data])

    ctx.status = res.status
    ctx.body = res.body

    await next()
  }
}

export const Before = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const hook: HookParams = { args, caller: this }

    if (typeof func === 'string') {
      tar[func]?.(hook)
    } else if (typeof func === 'function') {
      func(hook)
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}

export const After = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    let result = await base.apply(this, args)
    let hookResult = null
    const hook: HookParams = { args, result, caller: this }

    if (typeof func === 'string') {
      hookResult = tar[func]?.(hook)
    } else if (typeof func === 'function') {
      hookResult = func(hook)
    }

    if (hookResult) result = hookResult

    return result
  }

  return descriptor
}
