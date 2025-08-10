import { ClayParamType, ClayParamRequiredType, RouteDocs } from '.'
import { ValidationSchema, ValidatablePropertyConfig, RequiredPropertyConfig, EntityWithRequirements } from '../decorators'
import { Service } from '../service'
import { ServiceOpts } from '../service-middleware'
import { ClayRoute } from './clay-route'

export class ClayService {
  name: string
  path: string
  description: string = ''
  routes: ClayRoute[]
  opts: ServiceOpts
  
  private routeCache = new Map<string, ClayRoute>()

  constructor(service: Service, path: string, opts: ServiceOpts) {
    this.name = service.constructor.name
    this.path = path
    this.opts = opts

    this.routes = service.routes
      .filter((route) => !route.docs?.hidden)
      .map((route) => new ClayRoute(route))

    this.buildRouteCache()
  }

  private buildRouteCache() {
    for (const route of this.routes) {
      this.routeCache.set(route.getHandler(), route)
    }
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      routes: this.routes
    }
  }

  private getRouteByHandler(handler: string): ClayRoute | undefined {
    return this.routeCache.get(handler)
  }

  private processEntityRequirement = (schemaParam: ClayParamType, route: ClayRoute, entity: EntityWithRequirements) => {
    const requirements = entity.prototype._requestRequirements as { [key: string]: RequiredPropertyConfig }
    for (const [key, value] of Object.entries(requirements)) {
      if (value.methods?.includes(route.method)) {
        const required = value.requiredIf ? ClayParamRequiredType.SOMETIMES : ClayParamRequiredType.YES
        route.createOrUpdateParam(schemaParam, key, required)
      }
    }
  }

  private processArrayValidationSchema(route: ClayRoute, schema: ValidationSchema, schemaParam: ClayParamType) {
    const schemaValue = schema[schemaParam as keyof ValidationSchema]
    if (!schemaValue || !Array.isArray(schemaValue)) return

    for (const key of schemaValue as Array<string | EntityWithRequirements>) {
      if (typeof key === 'string') {
        route.createOrUpdateParam(schemaParam, key, ClayParamRequiredType.YES)
      } else {
        this.processEntityRequirement(schemaParam, route, key)
      }
    }
  }

  private processObjectValidationSchema(route: ClayRoute, schema: ValidationSchema, schemaParam: ClayParamType) {
    const schemaValue = schema[schemaParam as keyof ValidationSchema]
    if (!schemaValue || typeof schemaValue !== 'object') return

    for (const [key, item] of Object.entries(schemaValue as Record<string, ValidatablePropertyConfig>)) {
      let required = item.required ? ClayParamRequiredType.YES : ClayParamRequiredType.NO
      if (item.requiredIf) required = ClayParamRequiredType.SOMETIMES

      route.createOrUpdateParam(schemaParam, key, required)
    }
  }

  processValidationSchema(handler: string, schema: ValidationSchema) {
    const route = this.getRouteByHandler(handler)
    if (!route) return

    for (const schemaParam of [ClayParamType.QUERY, ClayParamType.BODY, ClayParamType.HEADERS]) {
      const schemaValue = schema[schemaParam as keyof ValidationSchema]
      if (Array.isArray(schemaValue)) {
        this.processArrayValidationSchema(route, schema, schemaParam)
      } else if (schemaValue) {
        this.processObjectValidationSchema(route, schema, schemaParam)
      }
    }
  }

  processRouteDocs(handler: string, docs: RouteDocs) {
    const route = this.getRouteByHandler(handler)
    if (!route) return

    if (docs.hidden) {
      this.routes = this.routes.filter((otherRoute) => otherRoute.getHandler() !== handler)
      this.routeCache.delete(handler)
      return
    }

    route.processRouteDocs(docs)
  }
}
