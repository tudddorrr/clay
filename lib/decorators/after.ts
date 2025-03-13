import { Request, Response, Service } from '../service'

export type AfterCallback<T extends Service, K, V> = (req: Request<K>, res: Response<V>, caller: T) => Promise<void>

export const After = <T extends Service, K, V>(func: AfterCallback<T, K, V>) => (tar: T, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
  const original = descriptor.value

  descriptor.value = async function (req: Request<K>): Promise<Response<V>> {
    const res: Response<V> = await original.apply(this, [req])
    await func(req, res, this as T)

    return res
  }

  return descriptor
}
