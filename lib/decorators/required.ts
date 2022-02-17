import { RequiredPropertyConfig, EntityWithRequirements } from '../declarations'

export const Required = (config?: RequiredPropertyConfig) => {
  return function (target: EntityWithRequirements, propertyKey: string) {
    target._requestRequirements = {
      ...(target._requestRequirements ?? {}),
      [config?.as ?? propertyKey]: {
        ...(config ?? {}),
        methods: config?.methods ?? ['POST', 'PUT']
      }
    }
  }
}
