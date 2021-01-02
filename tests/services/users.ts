import { Service, ServiceRequest, HookParams, ServiceResponse, Before, After } from '../../lib'

interface User {
  id: number
  name: string
  createdAt?: Date
}

export default class UserService implements Service<User> {
  users: User[] = []

  validate(hook: HookParams): void {
    const [req] = hook.args
    if (!req.body.name) req.ctx.throw(400, 'Needs a name')
  }

  metadata(hook: HookParams): ServiceResponse {
    const res: ServiceResponse = hook.result
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
  async get(req?: ServiceRequest): Promise<ServiceResponse> {
    const { id } = req.params

    // handle /users/:id
    if (id) {
      return {
        status: 200,
        body: {
          user: this.users.find((u) => u.id === Number(id))
        }
      }
    }

    // handle /users
    return {
      status: 200,
      body: {
        users: this.users
      }
    }
  }

  @Before('validate')
  @Before((hook: HookParams): void => {
    let [req] = hook.args
    req.body.createdAt = new Date()
  })
  async post(req?: ServiceRequest): Promise<ServiceResponse> {
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
