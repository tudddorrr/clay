import { HookParams, ServiceRequest, ValidationSchema } from './declarations'

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

const checkValidationSchemaParam = async (req: ServiceRequest, schema: ValidationSchema, schemaParam: string): Promise<void> => {
  for (let key of Object.keys(schema[schemaParam])) {
    const val = req[schemaParam]?.[key]
    if (typeof schema[schemaParam][key] === 'string') {
      if (!val) req.ctx.throw(400, schema[schemaParam][key])
    } else if (typeof schema[schemaParam][key] === 'function') {
      const validatorMessage = await (<Function>schema[schemaParam][key])(val, req)
      if (validatorMessage) req.ctx.throw(400, validatorMessage)
    }
  }
}

export const Validate = (schema: ValidationSchema) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const req = <ServiceRequest>args[0]

    if (schema.query) await checkValidationSchemaParam(req, schema, 'query')
    if (schema.body) await checkValidationSchemaParam(req, schema, 'body')

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}
