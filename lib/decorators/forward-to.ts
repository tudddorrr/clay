import { Request } from '../service'

export const ForwardTo = (serviceKey: string, methodName: string) => (tar: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  globalThis.clay.docs.documentForwardedRequest(serviceKey, methodName, tar.constructor.name, propertyKey)

  descriptor.value = async function (...args) {
    const req: Request = args[0]
    req.ctx.state.forwardHandler = {
      service: req.ctx.state.services[serviceKey],
      handler: methodName
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}