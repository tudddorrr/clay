import { ClayParamType, ClayParamRequiredType, RouteDocs } from '.'
import { HttpMethod, Route } from '../service'
import { ClayParam } from './clay-param'

export class ClayRoute {
  method: HttpMethod
  path: string
  private handler: string | Function

  description: string = ''
  params: ClayParam[] = []

  constructor(route: Route) {
    this.method = route.method
    this.path = route.path
    this.handler = route.handler

    this.extractRouteParams()
    this.processRouteDocs(route.docs)
  }

  toJSON() {
    return {
      method: this.method,
      path: this.path,
      description: this.description,
      params: this.params
    }
  }

  private extractRouteParams() {
    this.path.split('/').filter((part) => part.startsWith(':')).forEach((part) => {
      this.params.push(new ClayParam(ClayParamType.ROUTE, part.substring(1), ClayParamRequiredType.YES))
    })
  }

  getHandler(): string {
    return this.handler.toString()
  }

  createOrUpdateParam(type: ClayParamType, name: string, required: ClayParamRequiredType, description?: string) {
    const existingParam = this.params.find((param) => param.type === type && param.name === name)
    if (existingParam) {
      if (description) existingParam.description = description
      existingParam.required = required
    // don't document non-existent route params
    } else if (type !== ClayParamType.ROUTE) {
      const param = new ClayParam(type, name, required)
      param.description = description ?? ''
      this.params.push(param)
    }
  }

  processRouteDocs(docs: RouteDocs) {
    if (!docs) return

    this.description = docs.description ?? ''

    if (docs.params) {
      for (const schemaParam of [ClayParamType.QUERY, ClayParamType.BODY, ClayParamType.HEADERS, ClayParamType.ROUTE]) {
        if (docs.params[schemaParam]) {
          for (const key in docs.params[schemaParam]) {
            // route params should always be required
            const required = schemaParam === ClayParamType.ROUTE ? ClayParamRequiredType.YES : ClayParamRequiredType.NO
            this.createOrUpdateParam(schemaParam, key, required, docs.params[schemaParam][key])
          }
        }
      }
    }
  }
}
