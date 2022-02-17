import { HookParams, Request, Response } from '../declarations'

export const After = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const req: Request = args[0]
    const result: Response = await base.apply(this, args)

    Object.freeze(result)
    Object.freeze(result.body)

    const hook: HookParams = {
      req,
      result,
      caller: this
    }

    let hookResult: Response = null
    if (typeof func === 'string') {
      hookResult = await tar[func]?.(hook)
    } else if (typeof func === 'function') {
      hookResult = await func(hook)
    }

    return hookResult ?? result
  }

  return descriptor
}
