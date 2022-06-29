Clay is an ultra convenient minimal framework for building Koa apps.

## Features
* Expose API routes with minimal config
* Validate requests against conditions or an entity's required values
* Secure your endpoints with permission preflight checks
* Automatic documentation

## Examples
Docs: [docs](https://github.com/tudddorrr/clay/tree/main/docs)

Tests: [tests](https://github.com/tudddorrr/clay/tree/main/tests)

## Installation
```
yarn add koa-clay
// OR
npm i koa-clay --save
```

## Lightweight route configuration

```
// app.ts

const app = new Koa()

app.use(service('/users', new UserService()))

app.listen(3000, () => console.log('Listening...'))
```

Clients will now have access to handler functions you implement in your service:

```
// UserService.ts

async get(req: Request) {
  ...
}

async patch(req: Request) {
  ...
}
```

By default you'll get a method for each HTTP method (GET/POST/PUT/PATCH/DELETE). You can also define your own routes:

```
// AlbumService.ts
@Routes([
  // e.g. http://example.me/albums/1/personnel/3
  {
    method: 'GET',
    path: '/:id/personnel/:personnelId',
    handler: 'getPersonnel'
  },
  // i.e. http://example.me/albums
  {
    method: 'GET',
    path: '', // can be omitted
    handler: 'getAll'
  }
])
class AlbumService extends Service {
  async getPersonnel(req: Request) {
    ...
  }

  async getAll(req: Request) {
    ...
  }
}
```

When a request is made, the specified handler function will be invoked.

## Permissions and validation

Secure your endpoints using the [@HasPermission decorator](https://github.com/tudddorrr/clay/tree/main/docs/permissions.md), which will run a function to determine if the route can be accessed:

```
class SecretsPolicy extends Policy {
  async get(req: Request): Promise<PolicyResponse> {
    return req.ctx.user.hasScope('get')
  }
}

class SecretService extends Service {
  @HasPermission(SecretsPolicy, 'get')
  async get(req: Request): Promise<Response> { ... }
}
```

Validate incoming request data (body, query and headers) using the [@Validate decorator](https://github.com/tudddorrr/clay/tree/main/docs/permissions.md):

```
@Validate({
  body: ['username', 'age'], // these keys are required
})
async post(req: Request): Promise<Response> { ... }
```

You can also validate requests against an entity's required properties. Additionally, you can make keys required based on the request method:

```
class User {
  @Required() // required in POST and PUT requests
  username: string

  @Required({ methods: ['PUT'] }) // required in PUT requests
  age: number
}

@Validate({
  body: [User]
})
async post(req: Request): Promise<Response> { ... }
```

## Automatic documentation

Services, routes and parameters are [automatically documented](https://github.com/tudddorrr/clay/tree/main/docs/documenter.md). Descriptions can be added for routes and parameters for extra clarity.
