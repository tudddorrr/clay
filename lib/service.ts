import { pathToRegexp } from 'path-to-regexp'
import { Context } from 'koa'
import { Service, ServiceRoute, ServiceOpts, ServiceRequest, ServiceResponse } from './declarations'
import set from 'lodash.set'

const attachService = (ctx: Context, path: string, service: Service): void => {
  const standardisedPath = path.substring(1, path.length).replace(/\//g, '.')
  set(ctx, 'services.' + standardisedPath, service)
}

const buildParams = (ctx: Context, path: string): any => {
  const routeUrlData = path.split('/')
  const reqUrlData = ctx.path.split('/')

  return routeUrlData.reduce((acc, cur, idx) => {
    if (cur.startsWith(':')) return { ...acc, [cur.substring(1)]: reqUrlData[idx] }
    return acc
  }, {})
}

const buildDefaultRoutes = (service: Service): ServiceRoute[] => {
  const routes: ServiceRoute[] = []
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  methods.forEach((method) => {
    if (service[method.toLowerCase()]) {
      routes.push({
        method,
        path: `${method === 'POST' ? '' : '/:id'}`
      })
    }
  })
  
  routes.push({
    method: 'GET',
    path: '',
    handler: 'index'
  })

  return routes
}

const getDefaultPathForMethod = (service: Service, method: string): string => {
  const defaultRoutes: ServiceRoute[] = buildDefaultRoutes(service)
  if (method === 'GET') {
    return ''
  } else {
    return defaultRoutes.find((route) => route.method === method)?.path ?? ''
  }
}

const getRouteHandler = (service: Service, route: ServiceRoute): Function => {
  if (typeof route.handler === 'string') {
    return service[route.handler]
  } else if (typeof route.handler === 'function') {
    const handlerFunc = <Function>route.handler
    return handlerFunc(service)
  } else {
    return service[route.method.toLowerCase()]
  }
}

const buildDebugRoute = (route: ServiceRoute) => {
  const handler = route.handler
  ? typeof route.handler === 'function' ? '[Function]' : `${route.handler}()`
  : `${route.method.toLowerCase()}()`
  return `${route.method} ${route.path} => ${handler}`
}

const hasDefinedRoute = (routes: ServiceRoute[], method: string): boolean => {
  return Boolean(routes?.find((route) => route.method === method))
}

export function service(path: string, service: Service, opts: ServiceOpts = {}) {
  let routes: ServiceRoute[] = buildDefaultRoutes(service).filter((route) => {
    return !hasDefinedRoute(service.routes, route.method)
  })

  const definedRoutes: ServiceRoute[] = service.routes?.map((route: ServiceRoute) => {
    return {
      ...route,
      path: route.path ?? getDefaultPathForMethod(service, route.method) ?? ''
    }
  })
  
  if (definedRoutes) {
    const definedMethods = definedRoutes.map((route) => route.method)
    routes.filter((route) => !definedMethods.includes(route.method))
    routes = routes.concat(definedRoutes)
  }

  const prefix = opts.prefix ?? ''
  routes = routes.map((route: ServiceRoute) => ({
    ...route,
    path: prefix + path + route.path
  }))

  const debug = opts.debug
  if (debug) {
    console.log(`Available ${path} service routes:`)
    console.log(routes.map(buildDebugRoute))
  }
  
  return async (ctx, next) => {
    attachService(ctx, path, service)

    const route = routes.find((r) => r.method === ctx.method && pathToRegexp(r.path).test(ctx.path))
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

    const data: ServiceRequest = {
      ctx,
      query: ctx.query,
      path: ctx.path,
      headers: ctx.headers,
      params: buildParams(ctx, route.path),
      body: ctx.request.body
    }

    const res: ServiceResponse = await handler.apply(service, [data])
    ctx.status = res.status
    ctx.body = res.body

    await next()
  }
}
