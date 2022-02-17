import { Context } from 'koa'

export interface Request {
  ctx: Context
  headers: { [key: string]: any }
  path: string
  query?: { [key: string]: string }
  params?: { [key: string]: string }
  body?: { [key: string]: any }
}

export interface Response {
  status: number
  body?: {
    [key: string]: any
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
