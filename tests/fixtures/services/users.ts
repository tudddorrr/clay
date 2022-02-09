import { Service, Request, HookParams, Response, Before, After, Validate } from '../../../lib'

interface User {
  id: number
  name: string
  createdAt?: Date
}

export default class UserService implements Service {
  users: User[] = []

  metadata(hook: HookParams): Response {
    const res: Response = hook.result
    return {
      ...res,
      body: {
        ...res.body,
        metadata: {
          timestamp: new Date()
        }
      }
    }
  }

  @After('metadata')
  async get(req: Request): Promise<Response> {
    const { id } = req.params

    // handle /users/:id
    return {
      status: 200,
      body: {
        user: this.users.find((u) => u.id === Number(id))
      }
    }
  }

  @After('metadata')
  async index(req: Request): Promise<Response> {
    // handle /users
    return {
      status: 200,
      body: {
        users: this.users
      }
    }
  }

  @Validate({
    body: {
      name: 'Needs a name'
    }
  })
  @Before((hook: HookParams): void => {
    const req: Request = hook.req
    req.body.createdAt = new Date()
  })
  async post(req: Request): Promise<Response> {
    const len = this.users.push({
      ...req.body,
      id: this.users.length + 1,
      name: req.body.name
    })

    return {
      status: 200,
      body: {
        user: this.users[len - 1]
      }
    }
  }
}
