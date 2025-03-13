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
npm i koa-clay --save
```

## Lightweight route configuration

```typescript
// app.ts

const app = new Koa()

app.use(service('/users', new UserService()))

app.listen(3000, () => console.log('Listening...'))
```

Clients will now have access to handler functions you implement in your service:

```typescript
// AlbumService.ts
class AlbumService extends Service {
  // e.g. http://example.me/albums/1/personnel/3
  @Route({
    method: 'GET',
    path: '/:id/personnel/:personnelId'
  })
  async getPersonnel(req: Request) {
    ...
  }

  // i.e. http://example.me/albums
  @Route({
    method: 'GET'
  })
  async getAll(req: Request) {
    ...
  }
}
```

When a request is made, the specified handler function will be invoked.

## Permissions and validation

Secure your endpoints using the [@HasPermission decorator](https://github.com/tudddorrr/clay/tree/main/docs/permissions.md), which will run a function to determine if the route can be accessed:

```typescript
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

Validate incoming request data (body, query and headers) using the [@Validate decorator](https://github.com/tudddorrr/clay/tree/main/docs/validation.md):

```typescript
@Validate({
  body: ['username', 'age'], // these keys are required
})
async post(req: Request): Promise<Response> { ... }
```

You can also validate requests against an entity's required properties. Additionally, you can make keys required based on the request method:

```typescript
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
