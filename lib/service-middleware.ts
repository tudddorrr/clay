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

const buildDefaultRoutes = (): Route[] => {
  const routes: Route[] = []
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  methods.forEach((method: HttpMethod) => {
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

const setServiceRoutes = async (service: Service, path: string, opts: ServiceOpts): Promise<void> => {
  const definedRoutes: Route[] = service.definedRoutes?.map((route: Route) => {
    return {
      ...route,
      path: route.path ?? getDefaultPathForMethod(route.method) ?? '',
      handler: route.handler ?? route.method.toLowerCase()
    }
  }) ?? []

  const routes: Route[] = buildDefaultRoutes().filter((route) => {
    // check for overlap between defined routes and implicit routes so that there's no doubling-up
    return !definedRoutes.find((defined) => route.method === defined.method && route.handler === defined.handler)
  }).concat(definedRoutes).map((route: Route) => ({
    ...route,
    path: (opts.prefix ?? '') + path + route.path
  }))

  const routeStatusCodes = await Promise.all(routes.map(async (route) => {
    try {
      const handler = getRouteHandler(service, route)
      const res = await handler?.apply(service)
      return res?.status
    } catch {
      return null
    }
  }))

  service.setRoutes(routes.filter((_, idx) => routeStatusCodes[idx] !== 405))

  if (opts.debug) {
    console.log(`Available ${path} service routes:`)
    console.log(service.routes.map(buildDebugRoute))
  }
}

const attachService = async (ctx: Context, path: string, service: Service, opts: ServiceOpts): Promise<void> => {
  if (!service.attached) {
    await setServiceRoutes(service, path, opts)
    globalThis.clay.docs.documentService(service, path, opts)
  }

  set(ctx.state, 'services.' + getServiceKey(path), service)
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
    await attachService(ctx, path, service, opts)

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
