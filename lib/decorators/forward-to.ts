import { Request } from '../service'
import { get } from 'lodash'

export const ForwardTo = (serviceKey: string, methodName: string) => (tar: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  globalThis.clay.docs.documentForwardedRequest(serviceKey, methodName, tar.constructor.name, propertyKey)

  descriptor.value = async function (req: Request) {
    req.ctx.state.forwardHandler = {
      service: get(req.ctx.state, `services.${serviceKey}.service`),
      handler: methodName
    }

    const result = await base.apply(this, [req])
    return result
  }

  return descriptor
}
