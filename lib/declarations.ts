import { Context } from 'koa'

export interface ServiceRequest {
  ctx: Context
  headers: { [key: string]: any }
  path: { [key: string]: string }
  query?: { [key: string]: string }
  params?: { [key: string]: string }
  body?: { [key: string]: any }
}

export interface ServiceResponse {
  status: number
  body?: {
    [key: string]: any
  }
}

export interface Service {
  [key: string]: any
  routes?: ServiceRoute[]

  index? (req?: ServiceRequest): Promise<ServiceResponse>

  get? (req?: ServiceRequest): Promise<ServiceResponse>

  post? (req?: ServiceRequest): Promise<ServiceResponse>

  put? (req?: ServiceRequest): Promise<ServiceResponse>

  patch? (req?: ServiceRequest): Promise<ServiceResponse>

  delete? (req?: ServiceRequest): Promise<ServiceResponse>
}

export interface HookParams {
  req: ServiceRequest
  result?: ServiceResponse
  caller: any
}

export interface ServiceRoute {
  method: string
  path?: string
  handler?: string | Function
}

export interface ServiceOpts {
  prefix?: string
  debug?: boolean
}

export type ValidationFunc = (val: unknown, req: ServiceRequest) => Promise<boolean>
export type Validatable = string | ValidationFunc | boolean

export interface ValidationSchema {
  query?: { [key: string]: Validatable } | string[]
  body?: { [key: string]: Validatable } | string[]
  headers?: { [key: string]: Validatable } | string[]
}

export class ServicePolicy {
  ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }
}

export class ServicePolicyDenial {
  data: { [key: string]: any }
  status: number

  constructor(data: { [key: string]: any }, status: number = 403) {
    this.data = data
    this.status = status
  }
}
