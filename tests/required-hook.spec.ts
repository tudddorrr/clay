import chai from 'chai'
import { Service, Request, Response, Validate, Required } from '../lib'
import server from './fixtures'
import buildFakeRequest from './buildFakeRequest'

const expect = chai.expect

describe('@Required hook', () => {
  after(() => {
    server.close()
  })

  it('should return a single error for a missing property with no configuration on a post request', async () => {
    class Stat {
      @Required()
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      }
    }))

    expect(res.status).to.equal(400)

    expect(res.body.errors).to.have.key('name')
    expect(res.body.errors.name).to.eql(['name is missing from the request body'])
  })

  it('should not return an error if the method does not match the default methods post and put', async () => {
    class Stat {
      @Required()
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async patch(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().patch(buildFakeRequest({
      ctx: {
        method: 'PATCH',
        state: {}
      }
    }))

    expect(res.status).to.equal(204)
  })

  it('should not return an error if the required fields are present', async () => {
    class Stat {
      @Required()
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      },
      body: {
        name: 'Blah'
      }
    }))

    expect(res.status).to.equal(204)
  })

  it('should return an error if a field alias is not present', async () => {
    class Stat {
      @Required({ as: 'entityName' })
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      },
      body: {
        name: 'Blah'
      }
    }))

    expect(res.status).to.equal(400)

    expect(res.body.errors).to.have.key('entityName')
    expect(res.body.errors.entityName).to.eql(['entityName is missing from the request body'])
  })

  it('should not return an error if a field alias is present', async () => {
    class Stat {
      @Required({ as: 'entityName' })
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      },
      body: {
        entityName: 'Blah'
      }
    }))

    expect(res.status).to.equal(204)
  })

  it('should not return an error if there are no required properties', async () => {
    class Stat {
      name: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      },
      body: {}
    }))

    expect(res.status).to.equal(204)
  })

  it('should let requiredIf take precedent over the request method requirement', async () => {
    class Stat {
      firstName: string

      @Required({
        requiredIf: (req: Request) => req.body.firstName
      })
      lastName: string
    }

    class StatsService implements Service {
      @Validate({
        body: [Stat]
      })
      async post(req: Request): Promise<Response> {
        return { status: 204 }
      }
    }

    const res = await new StatsService().post(buildFakeRequest({
      ctx: {
        method: 'POST',
        state: {}
      },
      body: {}
    }))

    expect(res.status).to.equal(204)
  })
})
