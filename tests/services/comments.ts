import { Service, ServiceRequest, HookParams, ServiceResponse, ServiceRoute, After } from '../../lib'

export const routes: ServiceRoute[] = [
  {
    method: 'POST',
    path: '/comments'
  },
  {
    method: 'GET',
    path: '/comments',
    handler: 'getMany'
  }
]

interface Comment {
  id: number
  title: string
  text: string
}

export default class CommentService implements Service {
  comments: Comment[] = []

  notifyEveryone(title: string): void {
    // send emails out...
  }

  @After((hook: HookParams): void => {
    const [req] = hook.args
    hook.caller.notifyEveryone(req.body.title)
  })
  async post(req?: ServiceRequest): Promise<ServiceResponse> {
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

  @After((hook: HookParams): void | ServiceResponse => {
    // this shouldn't modify the response returned
    const [req] = hook.args
    req.body.metadata = {
      timestamp: Date.now()
    }
  })
  async getMany(req?: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        comments: this.comments
      }
    }
  }
}
