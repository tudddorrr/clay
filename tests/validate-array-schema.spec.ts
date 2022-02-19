import chai from 'chai'
import { Service, Request, Response, Validate } from '../lib'
import buildMockRequest from './utils/buildMockRequest'

const expect = chai.expect

describe('@Validate decorator array schema', () => {
  it('should return a single error for a missing property', async () => {
    class SearchService implements Service {
      @Validate({
        query: ['search', 'itemsPerPage']
      })
      async index(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new SearchService().index(buildMockRequest({
      query: {
        itemsPerPage: '5'
      }
    }))

    expect(res.status).to.equal(400)

    expect(res.body.errors).to.have.key('search')
    expect(res.body.errors).to.not.have.key('itemsPerPage')
    expect(res.body.errors.search).to.eql(['search is missing from the request query'])
  })

  it('should return a multiple errors for multiple missing properties', async () => {
    class SearchService implements Service {
      @Validate({
        query: ['search', 'itemsPerPage']
      })
      async index(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new SearchService().index(buildMockRequest())

    expect(res.status).to.equal(400)
    expect(res.body.errors).to.have.keys(['search', 'itemsPerPage'])

    expect(res.body.errors.search).to.eql(['search is missing from the request query'])
    expect(res.body.errors.itemsPerPage).to.eql(['itemsPerPage is missing from the request query'])
  })

  it('should only return errors for null or undefined values', async () => {
    class SearchService implements Service {
      @Validate({
        query: ['search']
      })
      async index(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new SearchService().index(buildMockRequest({
      query: {
        search: ''
      }
    }))

    expect(res.status).to.equal(204)
  })
})
