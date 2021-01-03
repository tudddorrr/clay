import { pathToRegexp } from 'path-to-regexp'
import { Context } from 'koa'
import { Service, ServiceRoute, ServiceOpts, ServiceRequest, ServiceResponse } from './declarations'

const attachService = (ctx: Context, name: string, service: Service<any>): void => {
  if (ctx.services?.[name] === undefined) {
    ctx.services = {
      ...ctx.services,
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
