import { pathToRegexp } from 'path-to-regexp'
import { Context } from 'koa'
import { Route, Request, Response, HttpMethod, RedirectResponse, RouteHandler, Service } from './service'
import set from 'lodash.set'
import { getServiceKey } from './utils/getServiceKey'

export interface ServiceDocs {
  hidden?: boolean
  description?: string
}

export interface ServiceOpts {
  prefix?: string
  debug?: boolean
  docs?: ServiceDocs
}

const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const buildDefaultRoutes = (): Route[] => {
  const routes: Route[] = []

  httpMethods.forEach((method: HttpMethod) => {
    routes.push({
      method,
      path: `${method === 'POST' ? '' : '/:id'}`,
      handler: method.toLowerCase()
    })
  })
  
  routes.push({
    method: 'GET',
    path: '',
    handler: 'index'
  })

  return routes
}

const getDefaultPathForMethod = (method: HttpMethod): string => {
  const defaultRoutes: Route[] = buildDefaultRoutes()
  if (method === 'GET') {
    return ''
  } else {
    return defaultRoutes.find((route) => route.method === method)?.path ?? ''
  }
}

const getRouteHandler = (service: Service, route: Route): RouteHandler => {
  if (typeof route.handler === 'string') {
    return service[route.handler]
  } else if (typeof route.handler === 'function') {
    return route.handler(service)
  }
}

const buildDebugRoute = (route: Route) => {
  const handler = typeof route.handler === 'function' ? '[Function]' : `${route.handler}()`
  return `${route.method} ${route.path} => ${handler}`
}

const setServiceRoutes = (service: Service, path: string, opts: ServiceOpts): void => {
  const definedRoutes: Route[] = service.definedRoutes?.map((route: Route) => {
    return {
      ...route,
      path: route.path ?? getDefaultPathForMethod(route.method) ?? '',
      handler: route.handler ?? route.method.toLowerCase()
    }
  }) ?? []

  const routes: Route[] = buildDefaultRoutes().filter((route) => {
    // check implicit route has a handler
    if (!service.constructor.prototype.hasOwnProperty(route.handler as string)) return false

    // check for overlap between defined routes and implicit routes so that there's no doubling-up
    return !definedRoutes.find((defined) => route.method === defined.method && route.handler === defined.handler)
  }).concat(definedRoutes).map((route: Route) => ({
    ...route,
    path: (opts.prefix ?? '') + path + route.path
  }))

  service.setRoutes(routes)

  if (opts.debug) {
    console.log(`Available ${path} service routes:`)
    console.log(service.routes.map(buildDebugRoute))
  }
}

const attachService = (ctx: Context, path: string, service: Service, opts: ServiceOpts): void => {
  if (!service.attached) {
    setServiceRoutes(service, path, opts)
    globalThis.clay.docs.documentService(service, path, opts)
  }

  set(ctx.state, `services.${getServiceKey(path)}.service`, service)
}

const buildParams = (ctx: Context, path: string): any => {
  const routeUrlData = path.split('/')
  const reqUrlData = ctx.path.split('/')

  return routeUrlData.reduce((acc, cur, idx) => {
    if (cur.startsWith(':')) return { ...acc, [cur.substring(1)]: reqUrlData[idx] }
    return acc
  }, {})
}

export function service(path: string, service: Service, opts: ServiceOpts = {}) {
  const debug = opts.debug

  return async (ctx, next) => {
    attachService(ctx, path, service, opts)

    const route = service.routes.find((r) => r.method === ctx.method && pathToRegexp(r.path).test(ctx.path))
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
      query: ctx.query,
      path: ctx.path,
      headers: ctx.headers,
      params: buildParams(ctx, route.path),
      body: ctx.request.body
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
