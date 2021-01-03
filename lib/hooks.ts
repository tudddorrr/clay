import { HookParams } from './declarations'

export const Before = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const hook: HookParams = { args, caller: this }

    if (typeof func === 'string') {
      tar[func]?.(hook)
    } else if (typeof func === 'function') {
      func(hook)
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}

export const After = (func: string | Function) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    let result = await base.apply(this, args)
    let hookResult = null
    const hook: HookParams = { args, result, caller: this }

    if (typeof func === 'string') {
      hookResult = tar[func]?.(hook)
    } else if (typeof func === 'function') {
      hookResult = func(hook)
    }

    if (hookResult) result = hookResult

    return result
  }

  return descriptor
}
