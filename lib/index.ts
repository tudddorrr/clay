import { ClayDocs } from './documenter'

export * from './decorators'
export * from './documenter'
export * from './service'
export * from './service-middleware'
export * from './utils'

globalThis.clay = {
  docs: new ClayDocs()
}
