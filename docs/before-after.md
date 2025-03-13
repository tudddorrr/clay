# Before/After

These decorators allow you to run functions before or after your request handler. Note: requests and responses are `readonly`. The only exception to this is the Koa context's state.

## @Before

This will run _before_ your request handler, allowing you to access the request:

```typescript
class UserService {
  @Route({
    method: 'GET',
    path: '/:id'
  })
  @Before(async (req: Request): Promise<void> => {
    const userId = req.params.id
    const user = database.set(userId, {
      lastSeenAt: Date.now()
    })

    req.ctx.state.user = user
  })
  async get(req: Request): Promise<Response> { ... }
}
```

## @After

This will run _after_ your request handler, allowing you to access the request and response:

```typescript
class UserService {
  @Route({
    method: 'GET',
    path: '/:id'
  })
  @After(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id

    if (res.status === 200) {
      database.set(userId, {
        lastSeenAt: Date.now()
      })
    }
  })
  async get(req: Request): Promise<Response> { ... }
}
```

## Caller context

Both decorators have a `caller` parameter, allowing you to access the instance of the service that is handling the request:

```typescript
class UserService {
  @Route({
    method: 'GET',
    path: '/:id'
  })
  @Before(async (req: Request, caller: UserService): Promise<void> => {
    caller.setLastSeenAt(req)
  })
  async get(req: Request): Promise<Response> { ... }

  setLastSeenAt(req: Request): void {
    const userId = req.params.id
    database.set(userId, {
      lastSeenAt: Date.now()
    })
  }
}
```

or,

```typescript
class UserService {
  @Route({
    method: 'GET',
    path: '/:id'
  })
  @After(async (req: Request, res: Response, caller: UserService): Promise<void> => {
    caller.setLastSeenAt(req, res)
  })
  async get(req: Request): Promise<Response> { ... }

  setLastSeenAt(req: Request, res: Response): void {
    const userId = req.params.id

    if (res.status === 200) {
      database.set(userId, {
        lastSeenAt: Date.now()
      })
    }
  }
}
```
