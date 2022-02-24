import { Request, Response, BeforeCallback } from '../declarations'

 export const Before = (func: BeforeCallback) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
   const original = descriptor.value

   descriptor.value = async function (req: Request): Promise<Response> {
      await func(req, this)

      const res: Response = await original.apply(this, [req])
      return res
   }

   return descriptor
 }
