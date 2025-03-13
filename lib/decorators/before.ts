import { Request, Response, Service } from '../service'

export type BeforeCallback<T extends Service, K> = (req: Request<K>, caller: T) => Promise<void>

export const Before = <T extends Service, K>(func: BeforeCallback<T, K>) => (tar: T, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
  const original = descriptor.value

  descriptor.value = async function (req: Request<K>): Promise<Response> {
    await func(req, this as T)

    const res: Response = await original.apply(this, [req])
    return res
  }

  return descriptor
}
