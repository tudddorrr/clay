import { ServiceRoute } from '../declarations'

export const Routes = (routes: ServiceRoute[]) => (constructor: Function): void => {
  constructor.prototype.routes = routes
}
