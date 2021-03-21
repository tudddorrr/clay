import { EntityResourceInstance } from '../declarations'

export const Resource = (EntityResource: EntityResourceInstance<any>, bodyKey: string) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    let result = await base.apply(this, args)
    const val = result.body?.[bodyKey]
    if (!val) return result

    const transformedResource = Array.isArray(val)
      ? await Promise.all(val.map(async (entity) => await (new EntityResource(entity)).transform()))
      : await (new EntityResource(val)).transform()

    return {
      ...result,
      body: {
        ...result.body,
        [bodyKey]: transformedResource
      }
    }
  }

  return descriptor
}
