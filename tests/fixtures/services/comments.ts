import { Service, ServiceRequest, HookParams, ServiceResponse, After } from '../../../lib'
import { Routes } from '../../../lib/hooks/routes'

interface Comment {
  id: number
  title: string
  text: string
}

@Routes([
  {
    method: 'POST'
  },
  {
    method: 'GET',
    path: '/:id',
    handler: 'getOne'
  },
  {
    method: 'GET',
    handler: 'getMany'
  },
  {
    method: 'DELETE'
  }
])
export default class CommentService implements Service {
  comments: Comment[] = []

  notifyEveryone(title: string): void {
    // send emails out...
  }

  @After((hook: HookParams): void => {
    const req: ServiceRequest = hook.req
    hook.caller.notifyEveryone(req.body.title)
  })
  async post(req: ServiceRequest): Promise<ServiceResponse> {
    const len = this.comments.push({
      ...req.body,
      id: this.comments.length + 1,
      title: req.body.title,
      text: req.body.text
    })

    return {
      status: 200,
      body: {
        comment: this.comments[len - 1]
      }
    }
  }

  @After(async (hook: HookParams): Promise<void> => {
    // this shouldn't modify the response returned
    const req: ServiceRequest = hook.req
    req.body.metadata = {
      timestamp: Date.now()
    }
  })
  async getMany(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        comments: this.comments
      }
    }
  }

  async getOne(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        comment: this.comments[0]
      }
    }
  }

  async delete(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
