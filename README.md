Build Koa REST microservices without the hassle: quick to configure, minimal boilerplate and super convenient. Have a look at the [docs](https://github.com/sekaru/koa-rest-services/tree/main/docs) and [tests](https://github.com/sekaru/koa-rest-services/tree/main/tests) for examples.

## Installation
```
yarn add koa-rest-services
// OR
npm i koa-rest-services --save
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

Hooks let you run functions before or after your endpoint handlers. They can check and modify the data going in/out of your handlers. For example:

### Validating requests:

```
// UserService.ts

@Validate({
  body: {
    name: 'User needs a name'
  }
})
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