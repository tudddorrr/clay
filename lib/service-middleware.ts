import { pathToRegexp } from 'path-to-regexp'
import { Context, Next } from 'koa'
import { Request, Response, RedirectResponse, RouteHandler, Service, RouteConfig, DefaultBody } from './service'
import { set } from 'lodash'
import { getServiceKey } from './utils/getServiceKey'

export type ServiceDocs = {
  hidden?: boolean
  description?: string
}

export type ServiceOpts = {
  prefix?: string
  debug?: boolean
  docs?: ServiceDocs
}

const getRouteHandler = <T extends Service>(service: T, route: RouteConfig): RouteHandler => {
  return service[route.handler as keyof T] as unknown as RouteHandler
}

const buildDebugRoute = (route: RouteConfig) => {
  const handler = typeof route.handler === 'function' ? '[Function]' : `${route.handler}()`
  return `${route.method} ${route.path} => ${handler}`
}

const attachService = (ctx: Context, path: string, service: Service, opts: ServiceOpts): void => {
  if (!service.attached) {
    if (opts.debug) {
      console.log(`Available ${path} service routes:`)
      console.log(service.routes.map(buildDebugRoute))
    }

    service.routes = service.routes.map((route) => ({
      ...route,
      path: (opts.prefix ?? '') + path + route.path
    }))

    globalThis.clay.docs.documentService(service, path, opts)
    service.attached = true
  }

  set(ctx.state, `services.${getServiceKey(path)}.service`, service)
}

const buildParams = (ctx: Context, path: string): any => {
  const routeUrlData = path.split('/')
  const reqUrlData = ctx.path.split('/')

  return routeUrlData.reduce((acc, cur, idx) => {
    if (cur.startsWith(':')) return { ...acc, [cur.substring(1)]: decodeURIComponent(reqUrlData[idx]) }
    return acc
  }, {})
}

export function service<T extends Service>(path: string, service: T, opts: ServiceOpts = {}) {
  const debug = opts.debug

  return async function clayServiceMiddleware(ctx: Context, next: Next) {
    attachService(ctx, path, service, opts)

    const route = service.routes.find((r) => r.method === ctx.method && pathToRegexp(r.path).regexp.test(ctx.path))
    if (!route) {
      if (debug) console.warn(`Route for ${ctx.method} ${ctx.path} not found`)
      return await next()
    }

    if (debug) console.log(`Using route`, [buildDebugRoute(route)])
    const handler = getRouteHandler(service, route)
    if (!handler) {
      if (debug) console.log('Warning: route handler not found')
      return await next()
    }

    ctx.state.matchedRoute = route.path
    ctx.state.matchedServiceKey = getServiceKey(path)

    const data: Request = {
      ctx,
      query: (ctx.query ?? {}) as Record<string, string>,
      path: ctx.path,
      headers: (ctx.headers ?? {}) as Record<string, string>,
      params: buildParams(ctx, route.path),
      body: 'body' in ctx.request ? (ctx.request.body as DefaultBody) : {}
    }

    const res: Response | RedirectResponse = await handler.apply(service, [data])
    ctx.status = res.status

    if ('url' in res) {
      ctx.redirect(res.url)
    } else {
      ctx.body = res.body
    }

    await next()
  }
}
