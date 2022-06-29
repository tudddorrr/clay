import { Route } from '../service'

export const Routes = (routes: Route[]) => (constructor: Function): void => {
  constructor.prototype.definedRoutes = routes
}
