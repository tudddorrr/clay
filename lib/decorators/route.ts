import { RouteDocs } from '../documenter'
import { HttpMethod, SERVICE_ROUTES } from '../service'

export const Route = (route: { method: HttpMethod, path?: string, docs?: RouteDocs }) => {
  return function (target: any, propertyKey: string): void {
    if (!Reflect.has(target.constructor.prototype, SERVICE_ROUTES)) {
      Reflect.set(target.constructor.prototype, SERVICE_ROUTES, [])
    }

    const routes = Reflect.get(target.constructor.prototype, SERVICE_ROUTES)
    routes.push({
      ...route,
      path: route.path ?? '',
      handler: propertyKey
    })

    Reflect.set(target.constructor.prototype, SERVICE_ROUTES, routes)
  }
}
