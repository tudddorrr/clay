import { ServiceRequest, ValidationSchema } from '../declarations'

const checkValidationSchemaParam = async (req: ServiceRequest, schema: ValidationSchema, schemaParam: string): Promise<void> => {
  if (Array.isArray(schema[schemaParam])) {
    // e.g. { body: ['name', 'email'] }
    for (let key of schema[schemaParam]) {
      const val = req[schemaParam]?.[key]
      if (!val) req.ctx.throw(400, `Missing ${schemaParam} key: ${key}`)
    }
  } else {
    // e.g. { body: { name: 'Please provide a name' }}
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
}

export const Validate = (schema: ValidationSchema) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const req = <ServiceRequest>args[0]

    if (schema.query) await checkValidationSchemaParam(req, schema, 'query')
    if (schema.body) await checkValidationSchemaParam(req, schema, 'body')
    if (schema.headers) await checkValidationSchemaParam(req, schema, 'headers')

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}

export default Validate
