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

export type ParamDocs = {
  [key: string]: string
}

export type RouteSample = {
  title: string
  sample: {
    [key: string]: unknown
  }
}

export type RouteDocs = {
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
  
  private serviceNameCache = new Map<string, ClayService>()
  private serviceKeyCache = new Map<string, ClayService>()

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

  private getServiceByName(serviceName: string): ClayService | undefined {
    return this.serviceNameCache.get(serviceName)
  }

  private getServiceByKey(serviceKey: string): ClayService | undefined {
    return this.serviceKeyCache.get(serviceKey)
  }

  private processQueuedItemsForService(service: ClayService) {
    const serviceName = service.name
    const serviceKey = getServiceKey(service.path)
    
    // process validation params in batch
    const matchingValidationParams = this.queuedValidationParams.filter(q => q.serviceClassName === serviceName)
    for (const queuedValidationParam of matchingValidationParams) {
      service.processValidationSchema(queuedValidationParam.methodName, queuedValidationParam.schema)
    }
    
    // process route docs in batch
    const matchingRouteDocs = this.queuedRouteDocs.filter(q => q.serviceClassName === serviceName)
    for (const queuedRouteDoc of matchingRouteDocs) {
      service.processRouteDocs(queuedRouteDoc.methodName, queuedRouteDoc.docs)
    }
    
    // process forwarded requests in batch
    const matchingForwardedRequests = this.queuedForwardedRequests.filter(q => 
      q.decoratedServiceClassName === serviceName || 
      getServiceKey(q.forwardedServiceKey) === serviceKey
    )
    
    for (const queuedForwardedRequest of matchingForwardedRequests) {
      this.processForwardedRequest(queuedForwardedRequest, service)
    }
    
    // remove processed items from queues
    this.queuedValidationParams = this.queuedValidationParams.filter(q => q.serviceClassName !== serviceName)
    this.queuedRouteDocs = this.queuedRouteDocs.filter(q => q.serviceClassName !== serviceName)
    this.queuedForwardedRequests = this.queuedForwardedRequests.filter(q => 
      q.decoratedServiceClassName !== serviceName && 
      getServiceKey(q.forwardedServiceKey) !== serviceKey
    )
  }

  private processForwardedRequest(queuedForwardedRequest: QueuedForwardedRequest, currentService: ClayService) {
    const decoratedService = this.getServiceByName(queuedForwardedRequest.decoratedServiceClassName)
    const forwardedService = this.getServiceByKey(queuedForwardedRequest.forwardedServiceKey)
    
    if (decoratedService && forwardedService) {
      const decoratedServiceRoute = decoratedService.routes.find((route) => route.getHandler() === queuedForwardedRequest.decoratedMethodName)
      const forwardedServiceRoute = forwardedService.routes.find((route) => route.getHandler() === queuedForwardedRequest.forwardedMethodName)

      if (decoratedServiceRoute && forwardedServiceRoute && 
          !decoratedServiceRoute.description && 
          decoratedServiceRoute.params.length === 0) {
        decoratedServiceRoute.description = forwardedServiceRoute.description ?? decoratedServiceRoute.description
        decoratedServiceRoute.params.push(...forwardedServiceRoute.params)
      }
    }
  }

  documentService(service: Service, path: string, opts: ServiceOpts) {
    const clayService = new ClayService(service, path, opts)
    clayService.description = opts.docs?.description ?? ''
    
    this.services.push(clayService)
    
    // update caches for fast lookups
    this.serviceNameCache.set(clayService.name, clayService)
    this.serviceKeyCache.set(getServiceKey(path), clayService)
    
    // process all queued items for this service in one pass
    this.processQueuedItemsForService(clayService)
  }
}
