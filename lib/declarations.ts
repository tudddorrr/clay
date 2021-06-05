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
  basePath?: string
  routes?: ServiceRoute[]
  debug?: boolean
}

export interface ValidationSchema {
  query?: { [key: string]: string | Function } | string[]
  body?: { [key: string]: string | Function } | string[]
  headers?: { [key: string]: string | Function } | string[]
}

export class ServicePolicy {
  ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }
}
