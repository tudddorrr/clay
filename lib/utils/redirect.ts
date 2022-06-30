import { RedirectResponse, RedirectStatus } from '../service'

export function redirect(url: string, status: RedirectStatus = 303): RedirectResponse {
  return {
    status,
    url
  }
}
