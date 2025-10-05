import { pathToRegexp, Key } from 'path-to-regexp'
import { Context, Next } from 'koa'
import { Request, Response, RedirectResponse, RouteHandler, Service, RouteConfig, DefaultBody } from './service'
import { getServiceKey } from './utils/getServiceKey'
import { setNested } from './utils/setNested'

export type ServiceDocs = {
  hidden?: boolean
  description?: string
}

export type ServiceOpts = {
  prefix?: string
  debug?: boolean
  docs?: ServiceDocs
}

type CompiledRoute = {
  original: RouteConfig
  method: string
  path: string
  fullPath: string // full path including service path and prefix
  regexp: RegExp
  keys: Key[]
  paramNames: string[]
}

const serviceCache = new WeakMap<Service, {
  compiledRoutes: Map<string, CompiledRoute[]>
  attached: boolean
  prefix: string
  servicePath: string
}>()

const getRouteHandler = <T extends Service>(service: T, route: RouteConfig): RouteHandler => {
  return service[route.handler as keyof T] as unknown as RouteHandler
}

const buildDebugRoute = (route: RouteConfig) => {
  const handler = typeof route.handler === 'function' ? '[Function]' : `${route.handler}()`
  return `${route.method} ${route.path} => ${handler}`
}

const compileRoutes = (routes: RouteConfig[], prefix: string, servicePath: string): Map<string, CompiledRoute[]> => {
  const methodMap = new Map<string, CompiledRoute[]>()
  
  for (const route of routes) {
    const fullPath = route.path
    const { regexp, keys } = pathToRegexp(fullPath)
    
    const paramNames = keys.map(key => key.name)
    
    const compiledRoute: CompiledRoute = {
      original: route,
      method: route.method,
      path: route.path, // original path for reference
      fullPath, // full path for matching
      regexp,
      keys,
      paramNames
    }
    
    if (!methodMap.has(route.method)) {
      methodMap.set(route.method, [])
    }
    methodMap.get(route.method)!.push(compiledRoute)
  }
  
  return methodMap
}

const buildParams = (path: string, compiledRoute: CompiledRoute): Record<string, string> => {
  const params: Record<string, string> = {}
  const matches = compiledRoute.regexp.exec(path)
  
  if (matches) {
    for (let i = 1; i < matches.length; i++) {
      const key = compiledRoute.paramNames[i - 1]
      if (key && matches[i] !== undefined) {
        params[key] = decodeURIComponent(matches[i])
      }
    }
  }
  
  return params
}

const attachService = (ctx: Context, path: string, service: Service, opts: ServiceOpts): void => {
  let cached = serviceCache.get(service)
  
  if (!cached || !cached.attached) {
    if (opts.debug) {
      console.log(`Available ${path} service routes:`)
      console.log(service.routes.map(buildDebugRoute))
    }

    service.routes = service.routes.map((route) => ({
      ...route,
      path: (opts.prefix ?? '') + path + route.path
    }))

    if (opts.debug) {
      console.log(`Modified routes for ${path}:`)
      console.log(service.routes.map(buildDebugRoute))
    }

    // pre-compile all routes with prefix and service path for fast matching
    const prefix = opts.prefix ?? ''
    const compiledRoutes = compileRoutes(service.routes, prefix, path)
    
    if (opts.debug) {
      console.log(`Compiled routes for ${path}:`)
      for (const [method, routes] of compiledRoutes.entries()) {
        console.log(`${method}:`, routes.map(r => `${r.fullPath} => ${r.regexp.source}`))
      }
    }
    
    // cache the compiled routes
    cached = {
      compiledRoutes,
      attached: true,
      prefix,
      servicePath: path
    }
    serviceCache.set(service, cached)

    globalThis.clay.docs.documentService(service, path, opts)
    service.attached = true
  }

  if (!ctx.state.services) ctx.state.services = {}
  setNested(ctx.state.services, `${getServiceKey(path)}.service`, service)
}

const findMatchingRoute = (method: string, path: string, compiledRoutes: Map<string, CompiledRoute[]>): CompiledRoute | null => {
  const methodRoutes = compiledRoutes.get(method)
  if (!methodRoutes) return null
  
  for (const route of methodRoutes) {
    if (route.regexp.test(path)) {
      return route
    }
  }
  
  return null
}

export function service<T extends Service>(path: string, service: T, opts: ServiceOpts = {}) {
  const debug = opts.debug

  return async function clayServiceMiddleware(ctx: Context, next: Next) {
    attachService(ctx, path, service, opts)
    
    const cached = serviceCache.get(service)!
    const compiledRoute = findMatchingRoute(ctx.method, ctx.path, cached.compiledRoutes)
    
    if (!compiledRoute) {
      if (debug) {
        console.warn(`Route for ${ctx.method} ${ctx.path} not found`)
        console.log(`Available compiled routes for ${ctx.method}:`)
        const methodRoutes = cached.compiledRoutes.get(ctx.method) || []
        console.log(methodRoutes.map(r => `${r.fullPath} => ${r.regexp.source}`))
      }
      return await next()
    }

    if (debug) console.log(`Using route`, buildDebugRoute(compiledRoute.original))
    
    const handler = getRouteHandler(service, compiledRoute.original)
    if (!handler) {
      if (debug) console.log('Warning: route handler not found')
      return await next()
    }

    ctx.state.matchedRoute = compiledRoute.fullPath
    ctx.state.matchedServiceKey = getServiceKey(path)

    const data: Request = {
      ctx,
      query: (ctx.query ?? {}) as Record<string, string>,
      path: ctx.path,
      headers: (ctx.headers ?? {}) as Record<string, string>,
      params: buildParams(ctx.path, compiledRoute),
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
