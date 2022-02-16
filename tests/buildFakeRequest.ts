import { Request } from '../lib'

export default function buildFakeRequest(extra: any = {}, method: string = 'GET'): Request {
  return {
    query: {},
    body: {},
    headers: {},
    ctx: {
      method,
      state: {}
    },
    ...extra
  }
}
