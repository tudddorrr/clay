# Services

Services are classes that handle requests related to a single entity, e.g. Users, Posts or Comments.

To register a service, define it as a middleware:

```
app.use(service('/users', new UserService()))
```

The first parameter is the base path to your service (always starting with a /) and the second is a class that implements the `Service` interface.

You can also define extra options:
- `debug`: Prints useful information like all the routes available to a service

```
app.use(service('/users', new UserService(), {
  debug: false
}))
```

## Structure
A service is any class that extends the `Service` class. The class comes with functions for each HTTP method (e.g. `get()` and `put()`), which by default simply return a 405.

```
export default class UserService extends Service {
  async get(req: Request): Promise<Response> { ... }

  async put(req: Request): Promise<Response> { ... }
}
```

## Routes

A route (`Route`) is comprised of:
- `method`: a HTTP method (e.g. PUT)
- `path`: The path of the endpoint (optional, e.g. /:id)
- `handler` (optional): The name of or a function to call when the endpoint is called. If not defined, this will default to the HTTP method in lowercase (i.e. GET requests will call `get()`)

Routes can be declared using the `@Routes` decorator on your class which takes in a `Route[]`. They also exist as a member variable of your Service class named `routes`:

```
@Routes([
  {
    method: 'GET',
    path: '/:id/personnel/:personnelId',
    handler: 'getPersonnel'
  },
  {
    method: 'GET',
    path: '/:id'
  },
  {
    method: 'GET',
    path: '' // can be omitted
  }
])
class AlbumService extends Service {
  ...
  constructor() {
    console.log(this.routes)
  }
}
```

### Anonymous function handlers

You can define your route handlers as either function names or anonymous functions. The service class will automatically be passed in:
```
@Routes([
  {
    method: 'POST',
    path: '/:id/reviews',
    handler: () => async (req: Request): Promise<Response> => {
      return {
        status: 200,
        body: {
          review: req.body
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/:id/reviews/:reviewId',
    handler: (service: AlbumService) => async (req: Request): Promise<Response> => {
      return await service.editReview(req)
    }
  }
])
```

## Implicit routes

If no routes are defined, implementing a function named after a lowercase HTTP method (e.g. `put()` for PUT requests) will expose that route.

```
// clients can now call PUT /users/:id

async put(req: Request) { ... }
```

The following implicit routes will be exposed (if their respective functions are implemented):

```
GET /
GET /:id
POST /
PUT /:id
PATCH /:id
DELETE /:id
```

For GET requests, `index()` is called for `GET /` and `get()` is called for `GET /:id`.

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

```
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

```
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

```
app.use('/users', new UserService())
app.use('/api/users', new UserAPIService())
```

The documenter will automatically take the documentation from the forwarded-to handler and apply it to the current handler if there are no docs (e.g. no params and no description) for it already.
