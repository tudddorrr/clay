import { RedirectResponse, RedirectStatus } from '../declarations'

export function redirect(url: string, status: RedirectStatus = 303): RedirectResponse {
  return {
    status,
    url
  }
}
