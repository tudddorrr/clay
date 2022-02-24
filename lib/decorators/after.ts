import { Request, Response, AfterCallback } from '../declarations'

 export const After = (func: AfterCallback) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
   const original = descriptor.value

   descriptor.value = async function (req: Request): Promise<Response>{
     const res: Response = await original.apply(this, [req])
     await func(req, res, this)

     return res
   }

   return descriptor
 }
 