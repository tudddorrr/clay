import { RouteDocs } from '../documenter'

export const Docs = (docs: RouteDocs) => (tar: Object, propertyKey: string) => {
  globalThis.clay.docs.documentRoute(tar.constructor.name, propertyKey, docs)
}
