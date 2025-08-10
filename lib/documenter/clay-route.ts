import { ClayParamType, ClayParamRequiredType, RouteDocs, RouteSample } from '.'
import { HttpMethod, RouteConfig } from '../service'
import { ClayParam } from './clay-param'

export class ClayRoute {
  method: HttpMethod
  path: string
  private handler: string | Function

  description: string = ''
  params: ClayParam[] = []
  samples: RouteSample[] = []
  
  private paramCache = new Map<string, ClayParam>()

  constructor(route: RouteConfig) {
    this.method = route.method
    this.path = route.path
    this.handler = route.handler

    this.extractRouteParams()
    this.processRouteDocs(route.docs)
    
    this.buildParamCache()
  }

  toJSON() {
    return {
      method: this.method,
      path: this.path,
      description: this.description ?? '',
      params: this.params,
      samples: this.samples
    }
  }

  private extractRouteParams() {
    const pathParts = this.path.split('/')
    for (const part of pathParts) {
      if (part.startsWith(':')) {
        const paramName = part.substring(1)
        const param = new ClayParam(ClayParamType.ROUTE, paramName, ClayParamRequiredType.YES)
        this.params.push(param)
      }
    }
  }

  private buildParamCache() {
    for (const param of this.params) {
      const cacheKey = `${param.type}:${param.name}`
      this.paramCache.set(cacheKey, param)
    }
  }

  getHandler(): string {
    return this.handler.toString()
  }

  createOrUpdateParam(type: ClayParamType, name: string, required?: ClayParamRequiredType | null, description?: string) {
    const cacheKey = `${type}:${name}`
    const existingParam = this.paramCache.get(cacheKey)
    
    if (existingParam) {
      if (description) existingParam.description = description
      if (required !== null && required !== undefined) existingParam.required = required
    } else if (type !== ClayParamType.ROUTE) {
      // only create new params for non-route types
      const param = new ClayParam(type, name, required ?? ClayParamRequiredType.NO)
      if (description) param.description = description
      
      this.params.push(param)
      this.paramCache.set(cacheKey, param)
    }
  }

  processRouteDocs(docs: RouteDocs | undefined) {
    if (!docs) return

    if (docs.description) {
      this.description = docs.description
    }

    if (docs.params) {
      // process all parameter types in one pass
      for (const schemaParam of [ClayParamType.QUERY, ClayParamType.BODY, ClayParamType.HEADERS, ClayParamType.ROUTE]) {
        const paramDocs = docs.params[schemaParam]
        if (paramDocs) {
          // process all parameters for this type in batch
          for (const [key, description] of Object.entries(paramDocs)) {
            if (schemaParam === ClayParamType.ROUTE) {
              // for route params, find existing param and update description
              const existingParam = this.params.find(param => param.type === ClayParamType.ROUTE && param.name === key)
              if (existingParam && description) {
                existingParam.description = description
              }
            } else {
              const required = null // let the validation schema determine required status
              this.createOrUpdateParam(schemaParam, key, required, description)
            }
          }
        }
      }
    }

    if (docs.samples) {
      this.samples = docs.samples
    }
  }
}
