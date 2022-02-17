import chai from 'chai'
import { After, HookParams, Request, Response, Service } from '../lib'
import buildFakeRequest from './buildFakeRequest'
import server from './fixtures/index'
const expect = chai.expect

describe('@After hook', () => {
  after(() => {
    server.close()
  })

  it('should handle the @After metadata hook on GET', async () => {    
    class DemoService implements Service {
      @After(async (hook: HookParams) => {
        return {
          ...hook.result,
          body: {
            ...hook.result.body,
            metadata: {
              timestamp: Date.now()
            }
          }
        }
      })
      async post(req: Request): Promise<Response> {
        return { status: 200 }
      }
    }

    const res = await new DemoService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      }
    }))

    expect(res.body).to.have.property('metadata').with.property('timestamp')
  })

  it('should not allow the response body to be directly modified', async () => {    
    class DemoService implements Service {
      @After(async (hook: HookParams) => {
        const res: Response = hook.result
        try {
          res.body.metadata = {
            timestamp: Date.now()
          }
        } catch {}
      })
      async post(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            foo: 'bar'
          }
        }
      }
    }

    const res = await new DemoService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      }
    }))

    expect(res.body).not.to.have.property('metadata')
  })
})
