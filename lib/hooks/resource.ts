import { EntityResourceInstance } from '../declarations'

const Resource = (EntityResource: EntityResourceInstance<any>, bodyKey: string) => (tar: Object, _: string, descriptor: PropertyDescriptor) => {
  const base = descriptor.value

  descriptor.value = async function (...args) {
    let result = await base.apply(this, args)
    const val = result.body?.[bodyKey]
    if (!val) return result

    const transformedResource = Array.isArray(val)
      ? val.map((resource) => new EntityResource(resource))
      : new EntityResource(val)

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

export default Resource
