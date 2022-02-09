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

export interface HookParams {
  req: Request
  result?: Response
  caller: any
}

export interface Route {
  method: string
  path?: string
  handler?: string | Function
}

export interface ServiceOpts {
  prefix?: string
  debug?: boolean
}

export type ValidationFunc = (val: unknown, req: Request) => Promise<boolean>
export type Validatable = string | ValidationFunc | boolean

export interface ValidationSchema {
  query?: { [key: string]: Validatable } | string[]
  body?: { [key: string]: Validatable } | string[]
  headers?: { [key: string]: Validatable } | string[]
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
