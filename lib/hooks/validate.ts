import { ServiceRequest, ValidationSchema } from '../declarations'

function reject(req: ServiceRequest, message?: string): void {
  req.ctx.throw(400, message)
}

function valueIsValid(val: unknown): boolean {
  return val !== null && val !== undefined
}

async function checkValidationSchemaParam(req: ServiceRequest, schema: ValidationSchema, schemaParam: string): Promise<void> {
  if (Array.isArray(schema[schemaParam])) {
    // e.g. { body: ['name', 'email'] }
    for (let key of schema[schemaParam]) {
      const val = req[schemaParam]?.[key]
      if (!valueIsValid(val)) reject(req, `Missing ${schemaParam} key: ${key}`)
    }
  } else {
    // e.g. { body: { name: 'Please provide a name', email: () => { ... }, age: true } }
    for (let key of Object.keys(schema[schemaParam])) {
      const val = req[schemaParam]?.[key]

      if (typeof schema[schemaParam][key] === 'string') {
        if (!valueIsValid(val)) reject(req, schema[schemaParam][key])
      } else if (typeof schema[schemaParam][key] === 'function') {
        try {
          const result = await (<Function>schema[schemaParam][key])(val, req)
          if (!result) reject(req, `Missing ${schemaParam} key: ${key}`)
        } catch (err) {
          reject(req, err.message ?? `Missing ${schemaParam} key: ${key}`)
        }
      } else if (typeof schema[schemaParam][key] === 'boolean') {
        if (schema[schemaParam][key] && !valueIsValid(val)) reject(req, `Missing ${schemaParam} key: ${key}`)
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
