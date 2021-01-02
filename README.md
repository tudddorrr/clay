# Koa Services
REST Microservices without the hassle: quick to configure, minimal boilerplate and super convenient. Have a look at the [docs](https://github.com/sekaru/koa-services/tree/main/docs) and [tests](https://github.com/sekaru/koa-services/tree/main/test) for examples.

## Installation
```
yarn add koa-api-services
// OR
npm i koa-api-services --save
```

## Lightweight route configuration

```
// app.ts

const app = new Koa()

app.use(service('users', new UserService(), {
  basePath: '/users'
}))

app.listen(3000, () => console.log('Listening...'))
```

Clients will now have access to handler functions you implement in your service:

```
// UserService.ts

async get(req: ServiceRequest) {
  ...
}

async patch(req: ServiceRequest) {
  ...
}
```

By default you'll get a method for each HTTP method (GET/POST/PUT/PATCH/DELETE). You can also define your own routes:

```
// app.ts

app.use(service('albums', new AlbumService(), {
  routes: [
    {
      method: 'GET',
      path: '/albums/:id'
    },
    {
      method: 'GET',
      path: '/albums/:id/personnel/:personnelId',
      handler: 'getPersonnel'
    },
    {
      method: 'GET',
      path: '/albums',
      handler: 'getMany'
    }
  ]
}))
```

When a request is made, the specified handler function will be invoked.

## Hooks

Hooks let you run functions before or after your endpoint handlers. Hooks can modify the data coming in to a handler or the data being returned from the endpoint. For example:

### Validating requests:

```
// UserService.ts

validate(hook: HookParams): void {
  // throw an error if data is missing
  if (!hook.req.body.name) {
    ctx.throw(400, 'User needs a name')
  }
}

@Before('validate')
async post(req: ServiceRequest): Promise<User> {
  user = createUser(req.body)

  return {
    status: 200,
    body: user
  }
}
```

### Adding in metadata:

```
// UserService.ts

timestamp(hook: HookParams): ServiceResponse {
  // modifies the response to add a timestamp key
  const res = hook.result
  return {
    ...res,
    body: {
      ...res.body,
      timestamp: new Date()
    }
  }
}

@After('timestamp')
async get(req: ServiceRequest) {
  return {
    status: 200,
    body: {
      users
    }
  }
}
```