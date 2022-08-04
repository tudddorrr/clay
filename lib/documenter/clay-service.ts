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

  constructor(service: Service, path: string, opts: ServiceOpts) {
    this.name = service.constructor.name
    this.path = path
    this.opts = opts

    this.routes = service.routes
      .filter((route) => !route.docs?.hidden)
      .map((route) => new ClayRoute(route))
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      routes: this.routes
    }
  }

  private processEntityRequirement = (schemaParam: ClayParamType, route: ClayRoute, entity: EntityWithRequirements) => {
    const requirements = entity.prototype._requestRequirements as { [key: string]: RequiredPropertyConfig }
    for (const [key, value] of Object.entries(requirements)) {
      if (value.methods.includes(route.method)) {
        const required = value.requiredIf ? ClayParamRequiredType.SOMETIMES : ClayParamRequiredType.YES
        route.createOrUpdateParam(schemaParam, key, required)
      }
    }
  }

  private processArrayValidationSchema(route: ClayRoute, schema: ValidationSchema, schemaParam: ClayParamType) {
    if (!schema[schemaParam]) return

    for (const key of schema[schemaParam]) {
      if (typeof key === 'string') {
        route.createOrUpdateParam(schemaParam, key, ClayParamRequiredType.YES)
      } else {
        this.processEntityRequirement(schemaParam, route, key)
      }
    }
  }

  private processObjectValidationSchema(route: ClayRoute, schema: ValidationSchema, schemaParam: ClayParamType) {
    for (const key in schema[schemaParam]) {
      const item = schema[schemaParam][key] as ValidatablePropertyConfig

      let required = item.required ? ClayParamRequiredType.YES : ClayParamRequiredType.NO
      if (item.requiredIf) required = ClayParamRequiredType.SOMETIMES

      route.createOrUpdateParam(schemaParam, key, required)
    }
  }

  processValidationSchema(handler: string, schema: ValidationSchema) {
    const route = this.routes.find((route) => route.getHandler() === handler)
    if (!route) return

    for (const schemaParam of [ClayParamType.QUERY, ClayParamType.BODY, ClayParamType.HEADERS]) {
      if (Array.isArray(schema[schemaParam])) {
        this.processArrayValidationSchema(route, schema, schemaParam)
      } else {
        this.processObjectValidationSchema(route, schema, schemaParam)
      } 
    }
  }

  processRouteDocs(handler: string, docs: RouteDocs) {
    const route = this.routes.find((route) => route.getHandler() === handler)
    if (!route) return

    if (docs.hidden) {
      this.routes = this.routes.filter((otherRoute) => otherRoute.getHandler() !== route.getHandler())
      return
    }

    route.processRouteDocs(docs)
  }
}
