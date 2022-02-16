import { Request, ValidationSchema, HttpMethod, EntityWithRequirements, ValidationCondition, Response, BaseValidationConfig, ValidatablePropertyConfig, RequiredPropertyConfig } from '../declarations'

function reject(req: Request, key: string, message: string): void {
  req.ctx.state.errors = {
    ...req.ctx.state.errors,
    [key]: [
      ...(req.ctx.state.errors[key] ?? []),
      message
    ]
  }
}

function valueIsSet(val: unknown): boolean {
  return val !== null && val !== undefined
}

async function handleValidationConfig(req: Request, config: BaseValidationConfig, schemaParam: string, key: string, value: unknown, isRequired: boolean): Promise<void> {
  if (!valueIsSet(value)) {
    if (isRequired) reject(req, key, config.error ?? `${key} is missing from the request ${schemaParam}`)
  } else {
    const conditions: ValidationCondition[] = await config.validation?.(value, req)
    conditions?.filter((condition) => !condition.check).forEach((condition) => {
      reject(req, key, condition.error ?? `The provided ${key} value is invalid`)
    })
  }
}

async function handleArraySchema(req: Request, schema: ValidationSchema, schemaParam: string): Promise<void> {
  for (let item of schema[schemaParam]) {
    if (typeof item === 'string') {
      const val = req[schemaParam]?.[item]
      if (!valueIsSet(val)) reject(req, item, `${item} is missing from the request ${schemaParam}`)
    } else if(item.hasOwnProperty?.('prototype')) {
      const entity: EntityWithRequirements = item

      const requirements = Object.keys(entity.prototype._requestRequirements ?? {}).map((key: string): [string, RequiredPropertyConfig] => {
        return [key, entity.prototype._requestRequirements[key]]
      })

      for (const requirement of requirements) {
        const key = requirement[0]
        const config = requirement[1]

        let isRequired = config.methods.includes(req.ctx.method as HttpMethod)
        if (typeof config.requiredIf === 'function') {
          isRequired = await config.requiredIf(req)
        }

        const val = req[schemaParam]?.[key]
        await handleValidationConfig(req, config, schemaParam, key, val, isRequired)
      }
    }
  }
}

async function handleObjectSchema(req: Request, schema: ValidationSchema, schemaParam: string): Promise<void> {
  for (let key of Object.keys(schema[schemaParam])) {
    const validatable: ValidatablePropertyConfig = schema[schemaParam][key]
    const val = req[schemaParam]?.[key]

    const isRequired = await validatable.requiredIf?.(req) ?? validatable.required 
    await handleValidationConfig(req, validatable, schemaParam, key, val, isRequired)
  }
}

async function checkValidationSchemaParam(req: Request, schema: ValidationSchema, schemaParam: string): Promise<void> {
  if (Array.isArray(schema[schemaParam])) {
    // e.g. { body: ['name', 'email', MyEntity] }
    await handleArraySchema(req, schema, schemaParam)
  } else {
    // e.g. {
    //   body: {
    //     firstName: {
    //       required: true,
    //       error: 'Please provide a first name'
    //     },
    //     lastName: {
    //       requiredIf: async (req) => !req.email
    //     },
    //     email: {
    //       validation: async (val, req) => [
    //         {
    //           check: val.endsWith('ac.uk'),
    //           error: 'Please provide a university email'
    //         }
    //       ]
    //     }
    //   }
    // }

    await handleObjectSchema(req, schema, schemaParam)
  }
}

export const Validate = (schema: ValidationSchema) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args): Promise<Response> {
    const req: Request = args[0]
    req.ctx.state.errors = {}

    if (schema.query) await checkValidationSchemaParam(req, schema, 'query')
    if (schema.body) await checkValidationSchemaParam(req, schema, 'body')
    if (schema.headers) await checkValidationSchemaParam(req, schema, 'headers')

    if (Object.keys(req.ctx.state.errors).length > 0) {
      return {
        status: 400,
        body: {
          errors: req.ctx.state.errors
        }
      }
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}
