import { pathToRegexp } from 'path-to-regexp'
import { Context } from 'koa'
import { Service, ServiceRoute, ServiceOpts, ServiceRequest, ServiceResponse } from './declarations'

const attachService = (ctx: Context, name: string, service: Service): void => {
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

const buildDefaultRoutes = (service: Service): ServiceRoute[] => {
  const routes: ServiceRoute[] = []
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const noIdRequiredMethods = ['GET', 'POST']

  methods.forEach((method) => {
    if (service[method.toLowerCase()]) {
      routes.push({
        method,
        path: `${noIdRequiredMethods.includes(method) ? '' : '/:id'}`
      })
    }
  })
  
  routes.push({
    method: 'GET',
    path: `/:id`
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

export function service(name: string, service: Service, opts: ServiceOpts = {}) {
  const basePath = opts.basePath ?? ''

  let routes: ServiceRoute[] = buildDefaultRoutes(service).filter((route) => {
    return !hasDefinedRoute(opts.routes, route.method)
  })

  const definedRoutes: ServiceRoute[] = opts.routes?.map((route: ServiceRoute) => {
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

  routes = routes.map((route: ServiceRoute) => ({
    ...route,
    path: basePath + route.path
  }))

  const debug = opts.debug
  if (debug) {
    console.log(`Available ${name} service routes:`)
    console.log(routes.map(buildDebugRoute))
  }
  
  return async (ctx, next) => {
    attachService(ctx, name, service)

    const route = routes.find((r) => r.method === ctx.method && pathToRegexp(r.path).test(ctx.path))
    if (!route) {
      if (debug) console.log(`Route for ${ctx.method} ${ctx.path} not found`)
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

    let res: ServiceResponse = null
    res = await handler.apply(service, [data])

    ctx.status = res.status
    ctx.body = res.body

    await next()
  }
}
