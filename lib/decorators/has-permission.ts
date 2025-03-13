import { Context } from 'koa'
import { Request, Service } from '../service'

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

export const HasPermission = <T extends Service, P extends Policy>(
  PolicyType: { new (ctx: Context): P },
  handlerName: keyof {
    [K in keyof P as P[K] extends (req: Request) => Promise<PolicyResponse> ? K : never]: P[K]
  }
) => (tar: T, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (req: Request) {
    const policy = new PolicyType(req.ctx)
    const handler = policy[handlerName] as (req: Request) => Promise<PolicyResponse>
    const hookResult: PolicyResponse = await handler.call(policy, req)

    if (!hookResult) {
      req.ctx.throw(403)
    } else if (hookResult instanceof PolicyDenial) {
      const denial: PolicyDenial = hookResult as PolicyDenial
      req.ctx.throw(denial.status, denial.data)
    }

    const result = await base.apply(this, [req])
    return result
  }

  return descriptor
}
