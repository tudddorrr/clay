import { Context } from 'koa'
import { Request } from '../service'

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

export const HasPermission = (PolicyType: new (ctx: Context) => Policy, method: string) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const req: Request = args[0]
    const policy = new PolicyType(req.ctx)
    const hookResult: PolicyResponse = await policy[method](...args)

    if (!hookResult) {
      (<Request>args[0]).ctx.throw(403)
      return
    } else if (hookResult instanceof PolicyDenial) {
      const denial: PolicyDenial = hookResult as PolicyDenial
      (<Request>args[0]).ctx.throw(denial.status, denial.data)
      return
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}
