# Services

Services are classes that handle requests related to a single entity, e.g. Users, Posts or Comments.

To register a service, define it as a middleware:

```
app.use(service('users', new UserService()))
```

You can also define a few options:
- `prefix`: The starting path for all routes in this service. E.g. if set to `/users`, your UserService GET endpoint will be `GET /users/:id`. This will be added to the start of any routes you define
- `debug`: Prints useful information like all the routes available to a service

```
app.use(service('users', new UserService(), {
  prefix: '/users',
  routes: [ ... ]
}))
```

## Structure
A service is any class that implements the `Service` interface. The `Service` interface comes with functions for each HTTP method (e.g. `get()` and `put()`).

```
export default class UsersService implements Service {
  async get(req: ServiceRequest): Promise<ServiceResponse> { ... }

  async put(req: ServiceRequest): Promise<ServiceResponse> { ... }
}
```

## Routes

A route (`ServiceRoute`) is comprised of:
- `method`: a HTTP method (e.g. PUT)
- `path`: The path of the endpoint (e.g. /users)
- `handler` (optional): The name of or a function to call when the endpoint is called. If not defined, this will default to the HTTP method in lowercase (i.e. GET requests will call `get()`)

Routes exist as a member variable of your Service class named `routes`:

```
class AlbumsService implements Service {
  routes: ServiceRoute[] = [
    {
      method: 'GET',
      path: '/albums/:id/personnel/:personnelId',
      handler: 'getPersonnel'
    },
    {
      method: 'GET',
      path: '/albums/:id'
    },
    {
      method: 'GET',
      path: '/albums'
    }
  ]
}
```

### Anonymous function handlers

You can define your route handlers as either function names or anonymous functions. The service class will automatically be passed in:
```
routes = [
  {
    method: 'POST',
    path: '/albums/:id/reviews',
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
    path: '/albums/:id/reviews/:reviewId',
    handler: (service: AlbumService) => async (req: ServiceRequest): Promise<ServiceResponse> => {
      return await service.editReview(req)
    }
  }
]
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

You can access services from the app's context using: `ctx.services[serviceName]`

