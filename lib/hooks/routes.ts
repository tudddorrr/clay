import { Route } from '../declarations'

export const Routes = (routes: Route[]) => (constructor: Function): void => {
  constructor.prototype.routes = routes
}
