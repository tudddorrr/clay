import chai from 'chai'
import { Request, Response, Service } from '../lib'
import { After } from '../lib'
import buildMockRequest from './utils/buildMockRequest'

const expect = chai.expect

describe('@After decorator', () => {
  it('should correctly pass in the request and the response', async () => {
    let reqUserId: string, resStatus: number

    class UserService implements Service {
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

    class UserService implements Service {
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

  it('should deep freeze the request and response objects', async () => {
    class UserService implements Service {
      @After(async (req: Request, res: Response): Promise<void> => {
        res.body.userId = '2'
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            userId: req.query.id
          }
        }
      }

      @After(async (req: Request, res: Response): Promise<void> => {
        res.body.name = 'Bob'
      })
      async post(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            name: req.body.name
          }
        }
      }
    }

    let reqError: string = '', resError: string = ''

    try {
      await new UserService().get(buildMockRequest({
        query: {
          userId: 1
        }
      }))
    } catch (err) {
      reqError = err.message
    }

    expect(reqError).to.equal('Cannot assign to read only property \'userId\' of object \'#<Object>\'')

    try {
      await new UserService().post(buildMockRequest({
        body: {
          name: 'Jack'
        }
      }))
    } catch (err) {
      resError = err.message
    }

    expect(resError).to.equal('Cannot assign to read only property \'name\' of object \'#<Object>\'')
  })
})