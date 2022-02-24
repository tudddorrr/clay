import { Context } from 'koa'

export interface Request {
  readonly ctx: Context
  readonly headers: { readonly [key: string]: any }
  readonly path: string
  readonly query?: { readonly [key: string]: string }
  readonly params?: { readonly [key: string]: string }
  readonly body?: { readonly [key: string]: any }
}

export interface Response {
  readonly status: number
  readonly body?: {
    readonly [key: string]: any
  }
}

export interface Service {
  [key: string]: any
  routes?: Route[]

  index? (req?: Request): Promise<Response>

  get? (req?: Request): Promise<Response>

  post? (req?: Request): Promise<Response>

  put? (req?: Request): Promise<Response>

  patch? (req?: Request): Promise<Response>

  delete? (req?: Request): Promise<Response>
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Route {
  method: HttpMethod
  path?: string
  handler?: string | Function
}

export interface ServiceOpts {
  prefix?: string
  debug?: boolean
}

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

export type Validatable = { [key: string]: ValidatablePropertyConfig } | (string | (new () => any))[]

export type ValidationSchema = {
  query?: Validatable
  body?: Validatable
  headers?: Validatable
}

export class Policy {
  ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }
}

export class PolicyDenial {
  data: { [key: string]: any }
  status: number

  constructor(data: { [key: string]: any }, status: number = 403) {
    this.data = data
    this.status = status
  }
}

export type PolicyResponse = boolean | PolicyDenial

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

export type BeforeCallback = (req: Request, caller: Service) => Promise<void>
export type AfterCallback = (req: Request, res: Response, caller: Service) => Promise<void>
