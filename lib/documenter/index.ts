import { Service, ServiceOpts, ValidationSchema } from '../'
import { getServiceKey } from '../utils/getServiceKey'
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

export interface RouteSample {
  title: string
  sample: {
    [key: string]: unknown
  }
}

export interface RouteDocs {
  description?: string
  params?: {
    [ClayParamType.QUERY]?: ParamDocs
    [ClayParamType.BODY]?: ParamDocs
    [ClayParamType.HEADERS]?: ParamDocs
    [ClayParamType.ROUTE]?: ParamDocs
  }
  hidden?: boolean,
  samples?: RouteSample[]
}

type QueuedDoc = {
  serviceClassName: string
  methodName: string
}

type QueuedValidationParam = QueuedDoc & {
  schema: ValidationSchema
}

type QueuedRouteDoc = QueuedDoc & {
  docs: RouteDocs
}

type QueuedForwardedRequest = {
  forwardedServiceKey: string
  forwardedMethodName: string
  decoratedServiceClassName: string
  decoratedMethodName: string
}

export class ClayDocs {
  services: ClayService[] = []
  private queuedValidationParams: QueuedValidationParam[] = []
  private queuedRouteDocs: QueuedRouteDoc[] = []
  private queuedForwardedRequests: QueuedForwardedRequest[] = []

  toJSON() {
    return {
      services: this.services.filter((service) => !service.opts?.docs?.hidden)
    }
  }

  documentValidationSchema(serviceClassName: string, methodName: string, schema: ValidationSchema) {
    this.queuedValidationParams.push({ serviceClassName, methodName, schema })
  }

  documentRoute(serviceClassName: string, methodName: string, docs: RouteDocs) {
    this.queuedRouteDocs.push({ serviceClassName, methodName, docs })
  }

  documentForwardedRequest(forwardedServiceKey: string, forwardedMethodName: string, decoratedServiceClassName: string, decoratedMethodName: string) {
    this.queuedForwardedRequests.push({ forwardedServiceKey, forwardedMethodName, decoratedServiceClassName, decoratedMethodName })
  }

  private queuedDocMatchesService(service: ClayService, queuedDoc: QueuedDoc) {
    return service.name === queuedDoc.serviceClassName
  }

  private getQueuedForwardedRequestServices(newService: ClayService, queuedForwardedRequest: QueuedForwardedRequest): ClayService[] {
    const decoratedService = [...this.services, newService].find((service) => service.name === queuedForwardedRequest.decoratedServiceClassName)
    const forwardedService = [...this.services, newService].find((service) => {
      return getServiceKey(service.path) === queuedForwardedRequest.forwardedServiceKey
    })
    return [decoratedService, forwardedService]
  }

  private checkQueuedValidationParamsForService(service: ClayService) {
    for (const queuedValidationParam of this.queuedValidationParams) {
      if (this.queuedDocMatchesService(service, queuedValidationParam)) {
        service.processValidationSchema(queuedValidationParam.methodName, queuedValidationParam.schema)
      }
    }

    this.queuedValidationParams = this.queuedValidationParams.filter((queuedValidationParam) => !this.queuedDocMatchesService(service, queuedValidationParam))
  }

  private checkQueuedRouteDocsForService(service: ClayService) {
    for (const queuedRouteDoc of this.queuedRouteDocs) {
      if (this.queuedDocMatchesService(service, queuedRouteDoc)) {
        service.processRouteDocs(queuedRouteDoc.methodName, queuedRouteDoc.docs)
      }
    }

    this.queuedRouteDocs = this.queuedRouteDocs.filter((queuedRouteDoc) => !this.queuedDocMatchesService(service, queuedRouteDoc))
  }

  private checkQueuedForwardedRequestsForService(service: ClayService) {
    for (const queuedForwardedRequest of this.queuedForwardedRequests) {
      const [decoratedService, forwardedService] = this.getQueuedForwardedRequestServices(service, queuedForwardedRequest)

      if (decoratedService && forwardedService) {
        const decoratedServiceRoute = decoratedService.routes.find((route) => route.getHandler() === queuedForwardedRequest.decoratedMethodName)
        const forwardedServiceRoute = forwardedService.routes.find((route) => route.getHandler() === queuedForwardedRequest.forwardedMethodName)

        if (!decoratedServiceRoute.description && decoratedServiceRoute.params.length === 0) {
          decoratedServiceRoute.description = forwardedServiceRoute.description ?? decoratedServiceRoute.description
          decoratedServiceRoute.params.push(...forwardedServiceRoute.params)
        }
      }
    }

    this.queuedForwardedRequests = this.queuedForwardedRequests.filter((queuedForwardedRequest) => {
      const [decoratedService, forwardedService] = this.getQueuedForwardedRequestServices(service, queuedForwardedRequest)
      return !decoratedService || !forwardedService
    })
  }

  documentService(service: Service, path: string, opts: ServiceOpts) {
    const clayService = new ClayService(service, path, opts)
    clayService.description = opts.docs?.description ?? ''
    this.services.push(clayService)

    this.checkQueuedValidationParamsForService(clayService)
    this.checkQueuedRouteDocsForService(clayService)
    this.checkQueuedForwardedRequestsForService(clayService)
  }
}
