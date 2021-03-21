import { HookParams } from '../declarations'

export const After = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    let result = await base.apply(this, args)
    let hookResult = null
    const hook: HookParams = { req: args[0], result, caller: this }

    if (typeof func === 'string') {
      hookResult = await tar[func]?.(hook)
    } else if (typeof func === 'function') {
      hookResult = await func(hook)
    }

    if (hookResult) result = hookResult
    return result
  }

  return descriptor
}
