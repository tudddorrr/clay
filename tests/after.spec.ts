import chai from 'chai'
import { Request, Response, Service } from '../lib'
import { After } from '../lib'
import buildMockRequest from './utils/buildMockRequest'

const expect = chai.expect

describe('@After decorator', () => {
  it('should correctly pass in the request and the response', async () => {
    let reqUserId: string, resStatus: number

    class UserService extends Service {
      @After(async (req: Request, res: Response): Promise<void> => {
        reqUserId = req.query.userId
        resStatus = res.status
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200
        }
      }
    }

    await new UserService().get(buildMockRequest({
      query: {
        userId: '1'
      }
    }))

    expect(reqUserId).to.equal('1')
    expect(resStatus).to.equal(200)
  })

  it('should correctly pass the caller context', async () => {
    let reqUserId: string, resStatus: number

    class UserService extends Service {
      @After(async (req: Request, res: Response, caller: UserService): Promise<void> => {
        caller.handleAfter(req, res)
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200
        }
      }

      handleAfter(req: Request, res: Response): void {
        reqUserId = req.query.userId
        resStatus = res.status
      }
    }

    await new UserService().get(buildMockRequest({
      query: {
        userId: '1'
      }
    }))

    expect(reqUserId).to.equal('1')
    expect(resStatus).to.equal(200)
  })
})
