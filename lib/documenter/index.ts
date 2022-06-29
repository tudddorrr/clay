import { Service, ServiceOpts, ValidationSchema } from '../'
import { ClayService } from './clay-service'

export enum ClayParamType {
  QUERY = 'query',
  BODY = 'body',
  HEADERS = 'headers',
  ROUTE = 'route'
}

export enum ClayParamRequiredType {
  YES = 'YES',
  NO = 'NO',
  SOMETIMES = 'SOMETIMES'
}

export interface ParamDocs {
  [key: string]: string
}

export interface RouteDocs {
  description?: string
  params?: {
    [ClayParamType.QUERY]?: ParamDocs
    [ClayParamType.BODY]?: ParamDocs
    [ClayParamType.HEADERS]?: ParamDocs
    [ClayParamType.ROUTE]?: ParamDocs
  }
  hidden?: boolean
}

type QueuedDoc = {
  decoratorClassName: string
  decoratorMethodName: string
}

type QueuedValidationParam = QueuedDoc & {
  schema: ValidationSchema
}

type QueuedRouteDocs = QueuedDoc & {
  docs: RouteDocs
}

export class ClayDocs {
  services: ClayService[] = []
  private queuedValidationParams: QueuedValidationParam[] = []
  private queuedRouteDocs: QueuedRouteDocs[] = []

  toJSON() {
    return {
      services: this.services
    }
  }

  documentValidationSchema(decoratorClassName: string, decoratorMethodName: string, schema: ValidationSchema) {
    this.queuedValidationParams.push({ decoratorClassName, decoratorMethodName, schema })
  }

  documentRoute(decoratorClassName: string, decoratorMethodName: string, docs: RouteDocs) {
    this.queuedRouteDocs.push({ decoratorClassName, decoratorMethodName, docs })
  }

  private queuedDocMatchesService(service: ClayService, queuedDoc: QueuedDoc) {
    return service.name === queuedDoc.decoratorClassName
  }

  private checkQueuedValidationParamsForService(service: ClayService) {
    for (const queuedValidationParam of this.queuedValidationParams) {
      if (this.queuedDocMatchesService(service, queuedValidationParam)) {
        service.processValidationSchema(queuedValidationParam.decoratorMethodName, queuedValidationParam.schema)
      }
    }

    this.queuedValidationParams = this.queuedValidationParams.filter((queuedValidationParam) => !this.queuedDocMatchesService(service, queuedValidationParam))
  }

  private checkQueuedRouteDocsForService(service: ClayService) {
    for (const queuedRouteDoc of this.queuedRouteDocs) {
      if (this.queuedDocMatchesService(service, queuedRouteDoc)) {
        service.processRouteDocs(queuedRouteDoc.decoratorMethodName, queuedRouteDoc.docs)
      }
    }

    this.queuedRouteDocs = this.queuedRouteDocs.filter((queuedRouteDoc) => !this.queuedDocMatchesService(service, queuedRouteDoc))
  }

  documentService(service: Service, opts: ServiceOpts) {
    if (opts.docs?.hidden) return

    const clayService = new ClayService(service)
    clayService.description = opts.docs?.description ?? ''
    this.services.push(clayService)

    this.checkQueuedValidationParamsForService(clayService)
    this.checkQueuedRouteDocsForService(clayService)
  }
}
