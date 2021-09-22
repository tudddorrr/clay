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
A service is any class that implements the `Service` interface. The interface comes with functions for each HTTP method (e.g. `get()` and `put()`).

```
export default class UsersService implements Service {
  async get(req: ServiceRequest): Promise<ServiceResponse> { ... }

  async put(req: ServiceRequest): Promise<ServiceResponse> { ... }
}
```

## Routes

A route (`ServiceRoute`) is comprised of:
- `method`: a HTTP method (e.g. PUT)
- `path`: The path of the endpoint (optional, e.g. /:id)
- `handler` (optional): The name of or a function to call when the endpoint is called. If not defined, this will default to the HTTP method in lowercase (i.e. GET requests will call `get()`)

Routes can be declared using the `@Routes` decorator on your class which takes in a `ServiceRoute[]`. They also exist as a member variable of your Service class named `routes`:

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
class AlbumService implements Service {
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
    handler: () => async (req: ServiceRequest): Promise<ServiceResponse> => {
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
    handler: (service: AlbumService) => async (req: ServiceRequest): Promise<ServiceResponse> => {
      return await service.editReview(req)
    }
  }
])
```

## Implicit routes

If no routes are defined, implementing a function named after a lowercase HTTP method (e.g. `put()` for PUT requests) will expose that route.

```
// clients can now call PUT /users/:id

async put(req: ServiceRequest) { ... }
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

Requests (`ServiceRequest`) come with a number of convenient properties:
- `ctx`: The Koa context object
- `headers`: The request headers (e.g. `{ content-type: application/json }`)
- `path`: The request path (e.g. `/users/10?count=5`)
- `query`: Parsed query parameters (if supplied, e.g. `{ count: 5, page: 2 }`)
- `params`: Parsed path parameters (e.g. `:id` would appear as `{ id: 10 }`)
- `body`: The parsed request body (requires `koa-bodyparser`)

## Accessing other services

You can access services from the app's context using: `ctx.services[serviceName]`. Services are registered using `lodash.set`, for example:

- `app.use(service('/users', new UserService()))`, can be accessed via `ctx.services.users`
- `app.use(service('/api/users', new UserService()))`, can be accessed via `ctx.services.api.users`
- `app.use(service('/v1/api/users', new UserService()))`, can be accessed via `ctx.services.v1.api.users`

