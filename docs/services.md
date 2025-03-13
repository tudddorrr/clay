# Services

Services are classes that handle requests related to a single entity, e.g. Users, Posts or Comments.

To register a service, define it as a middleware:

```typescript
app.use(service('/users', new UserService()))
```

The first parameter is the base path to your service (always starting with a /) and the second is a class that extends the `Service` class.

You can also define extra options:
- `debug`: Prints useful information like all the routes available to a service

```typescript
app.use(service('/users', new UserService(), {
  debug: false
}))
```

## Structure
A service is any class that extends the `Service` class. The class comes with functions for each HTTP method (e.g. `get()` and `put()`), which by default simply return a 405.

```typescript
export default class UserService extends Service {
  async get(req: Request): Promise<Response> { ... }

  async put(req: Request): Promise<Response> { ... }
}
```

## Routes

A route (`Route`) is comprised of:
- `method`: a HTTP method (e.g. PUT)
- `path`: The path of the endpoint (optional, e.g. /:id)
- `docs` (optional): Documentation for your endpoint

Routes can be declared using the `@Route` decorator on `Service` methods:

```typescript
class AlbumService extends Service {
  @Route({
    method: 'GET',
    path: '/:id/personnel/:personnelId'
  })
  async getPersonnel(req: Request) {
    ...
  }

  @Route({
    method: 'GET'
  })
  async getAll(req: Request) {
    ...
  }
}
```

## Requests

Requests (`Request`) come with a number of convenient properties:
- `ctx`: The Koa context object
- `headers`: The request headers (e.g. `{ content-type: application/json }`)
- `path`: The request path (e.g. `/users/10?count=5`)
- `query`: Parsed query parameters (if supplied, e.g. `{ count: 5, page: 2 }`)
- `params`: Parsed path parameters (e.g. `:id` would appear as `{ id: 10 }`)
- `body`: The parsed request body (requires `koa-bodyparser`)

Requests are readonly and therefore immutable (apart from the `ctx`'s state).

## Accessing other services

You can access services from the app's context using: `ctx.state.services[serviceName].service`. Services are registered using `lodash.set` and can be accessed using `lodash.get`, for example:

- `app.use(service('/users', new UserService()))`, can be accessed via `ctx.state.services.users.service`
- `app.use(service('/api/users', new UserService()))`, can be accessed via `ctx.services.api.users.service`
- `app.use(service('/api/users/:userId/comments', new CommentService()))`, can be accessed via `ctx.state.services.api.users.comments.service`
- `app.use(service('/api/users/:userId/comments/:commentId/upvotes', new UpvoteService()))`, can be accessed via `ctx.state.services.api.users.comments.upvotes.service`

## Accessing information about the current route

If you need to know what the current route being used is, you can access it using `ctx.state.matchedRoute` which will return, for example, `/users/:id`.

You can also use `ctx.state.matchedServiceKey` to access the current service's key (e.g. `api.users.comments` - which can be used as described above).

## Redirects

Sometimes you'll want to use `context.redirect()` instead of returning a response with a body. To do this you can use the `redirect()` helper function to return a `RedirectResponse`:

```typescript
import { redirect, RedirectResponse, Service } from 'koa-clay'

class OldService extends Service {
  async index(): Promise<RedirectResponse> {
    return redirect('/new-location')
  }
}
```

By default the `redirect()` helper will return a 303. You can optionally pass a different 30x status code in the second parameter.

## Forwarding requests

If you want to forward a request from one service to another, you can use the `ForwardTo` decorator and the `forwardRequest()` helper:

```typescript
import { ForwardTo, forwardRequest, Service } from 'koa-clay'

class UserAPIService extends Service {
  @ForwardTo('users', 'index')
  async index(): Promise<Response> {
    return await forwardRequest(req, {
      query: {
        fromAPI: 'true'
      }
    })
  }
}
```

The `ForwardTo` decorator takes the registered service key of the other service (see "Accessing other services" above) and the name of the handler to call.

After decorating the function, call the `forwardRequest()` helper to forward the current request (along with any extra parameters).

Note: you should register (i.e. apply the middleware) services that are forwarded-to _before_ services that forward requests. In the example above, you would need to register the `UserService` before the `UserAPIService`:

```typescript
app.use('/users', new UserService())
app.use('/api/users', new UserAPIService())
```

The documenter will automatically take the documentation from the forwarded-to handler and apply it to the current handler if there are no docs (e.g. no params and no description) for it already.
