import { Context } from 'koa'

export interface ServiceRequest {
  ctx: Context
  headers: { [key: string]: any }
  path: { [key: string]: string }
  query?: { [key: string]: any }
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

  // todo HEAD, OPTIONS

  get? (req?: ServiceRequest): Promise<ServiceResponse>

  post? (req?: ServiceRequest): Promise<ServiceResponse>

  put? (req?: ServiceRequest): Promise<ServiceResponse>

  patch? (req?: ServiceRequest): Promise<ServiceResponse>

  delete? (req?: ServiceRequest): Promise<ServiceResponse>
}

export interface HookParams {
  args: Array<any>
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
