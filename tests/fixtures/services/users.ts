import { Service, Request, Response, Validate } from '../../../lib'

interface User {
  id: number
  name: string
  createdAt?: Date
}

export default class UserService implements Service {
  users: User[] = []

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
      name: {
        required: true,
        error: 'Needs a name'
      }
    }
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
