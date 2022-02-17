import { Context } from 'koa'
import { Policy, PolicyDenial, PolicyResponse, Request } from '../declarations'

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
