import { Context } from 'koa'
import { ServicePolicy, ServicePolicyDenial, ServiceRequest } from '../declarations'

export const HasPermission = (PolicyType: new (ctx: Context) => ServicePolicy, method: string) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    const req: ServiceRequest = args[0]
    const policy = new PolicyType(req.ctx)
    const hookResult = await policy[method](...args)

    if (!hookResult) {
      (<ServiceRequest>args[0]).ctx.throw(403)
      return
    } else if (hookResult instanceof ServicePolicyDenial) {
      const denial: ServicePolicyDenial = hookResult as ServicePolicyDenial
      
      (<ServiceRequest>args[0]).ctx.throw(denial.status, denial.data)
      return
    }

    const result = await base.apply(this, args)
    return result
  }

  return descriptor
}
