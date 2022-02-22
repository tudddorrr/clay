import { Request, Response, AfterCallback } from '../declarations'
import deepFreeze from '../utils/deepFreeze'

 export const After = (func: AfterCallback) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
   const original = descriptor.value

   descriptor.value = async function (req: Request): Promise<Response>{
     const res: Response = await original.apply(this, [req])
     await func(deepFreeze(req, ['ctx']), deepFreeze(res), this)

     return res
   }

   return descriptor
 }
 