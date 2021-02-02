import { HookParams } from '../declarations'

const Before = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const hook: HookParams = { req: args[0], caller: this }

    if (typeof func === 'string') {
      await tar[func]?.(hook)
    } else if (typeof func === 'function') {
      await func(hook)
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}

export default Before
