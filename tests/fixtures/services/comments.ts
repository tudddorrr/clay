import { Service, Request, Response, Routes } from '../../../lib'

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

  async post(req: Request): Promise<Response> {
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

  async getMany(req: Request): Promise<Response> {
    return {
      status: 200,
      body: {
        comments: this.comments
      }
    }
  }

  async getOne(req: Request): Promise<Response> {
    return {
      status: 200,
      body: {
        comment: this.comments[0]
      }
    }
  }

  async delete(req: Request): Promise<Response> {
    return {
      status: 204
    }
  }
}
