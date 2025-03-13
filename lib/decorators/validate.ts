import { HttpMethod, Request, Response } from '../service'

export type ValidationCondition = {
  check: boolean,
  error?: string
  break?: boolean
}

export type BaseValidationConfig = {
  requiredIf?: (req: Request) => Promise<boolean>,
  error?: string,
  validation?: (val: unknown, req: Request) => Promise<ValidationCondition[]> 
}

export type ValidatablePropertyConfig = BaseValidationConfig & {
  required?: boolean
}

type ValidatableEntity = new (...args: any[]) => any
export type Validatable = { [key: string]: ValidatablePropertyConfig } | (string | ValidatableEntity)[]

export type ValidationSchema = {
  query?: Validatable
  body?: Validatable
  headers?: Validatable
}

type SchemaParam = keyof ValidationSchema

export type RequiredPropertyConfig = BaseValidationConfig & {
  as?: string
  methods?: HttpMethod[]
}

export type EntityWithRequirements = {
  _requestRequirements?: {
    [key: string]: RequiredPropertyConfig
  }
  [key: string]: any
}

function reject(req: Request, key: string, message: string): void {
  req.ctx.state.errors = {
    ...req.ctx.state.errors,
    [key]: [
      ...(req.ctx.state.errors[key] ?? []),
      message
    ]
  }
}

async function handleValidationConfig(req: Request, config: BaseValidationConfig, schemaParam: SchemaParam, key: string, value: unknown, isRequired: boolean): Promise<void> {
  if (value === undefined) {
    if (isRequired) reject(req, key, config.error ?? `${key} is missing from the request ${schemaParam}`)
  } else {
    const conditions: ValidationCondition[] = await config.validation?.(value, req) ?? []
    const failedConditions = conditions.filter((condition) => !condition.check)

    for (const failedCondition of failedConditions) {
      reject(req, key, failedCondition.error ?? `The provided ${key} value is invalid`)
      if (failedCondition.break) break
    }
  }
}

async function handleArraySchema(req: Request, schema: ValidationSchema, schemaParam: SchemaParam): Promise<void> {
  const validatableArray = schema[schemaParam] as (string | ValidatableEntity)[]
  for (let item of validatableArray) {
    if (typeof item === 'string') {
      const value = req[schemaParam]?.[item]
      if (value === undefined) reject(req, item, `${item} is missing from the request ${schemaParam}`)
    } else if(item.hasOwnProperty?.('prototype')) {
      const entity: EntityWithRequirements = item

      for (const entry of Object.entries(entity.prototype._requestRequirements ?? {})) {
        const key = entry[0]
        const config = entry[1] as RequiredPropertyConfig

        let isRequired = config.methods?.includes(req.ctx.method as HttpMethod) ?? false
        if (typeof config.requiredIf === 'function') {
          isRequired = await config.requiredIf(req)
        }

        const value = req[schemaParam]?.[key]
        await handleValidationConfig(req, config, schemaParam, key, value, isRequired)
      }
    }
  }
}

async function handleObjectSchema(req: Request, schema: ValidationSchema, schemaParam: SchemaParam): Promise<void> {
  for (const key of Object.keys(schema[schemaParam] ?? {})) {
    const validatable = (schema[schemaParam] as Record<string, ValidatablePropertyConfig>)[key]
    const value = req[schemaParam]?.[key]

    const isRequired = await validatable.requiredIf?.(req) ?? validatable.required ?? false
    await handleValidationConfig(req, validatable, schemaParam, key, value, isRequired)
  }
}

async function checkValidationSchemaParam(req: Request, schema: ValidationSchema, schemaParam: SchemaParam): Promise<void> {
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

export const Validate = (schema: ValidationSchema) => (tar: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  globalThis.clay.docs.documentValidationSchema(tar.constructor.name, propertyKey, schema)

  descriptor.value = async function (req: Request): Promise<Response> {
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

    const result = await base.apply(this, [req])
    return result
  }

  return descriptor
}
