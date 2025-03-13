# Documenter

Clay documents your services, its routes and their parameters out-of-the-box.

## Service documentation

By default, documentation for a service looks like this:

```typescript
{
  name: 'UserService',
  description: '',
  routes: [ ... ]
}
```

The name reflects the stringified version of the class name and the routes are pulled directly from the service's available routes.

### Options

To set the description of the service, you can optionally pass `ServiceDocs` to the middleware:

```typescript
app.use(service('/users', new UserService(), {
  docs: {
    description: 'The service for users'
  }
}))
```

You can also hide a service to prevent it and its routes from being surfaced in the documentation:

```typescript
app.use(service('/users', new UserService(), {
  docs: {
    hidden: true
  }
}))
```

## Route documentation

By default, documentation for a route looks like this:

```typescript
{
  method: 'PUT',
  path: '/v1/users/:id',
  description: '',
  params: [ ... ]
}
```

### Descriptions

When defining a route using the `@Route` decorator, you can optionally pass a `RouteDocs` config:

```typescript
@Route({
  method: 'PUT',
  path: '/:id',
  docs: {
    description: 'Update a user'
  }
})
async put(): Promise<void> {
  return {
    status: 204
  }
}
```

## Param documentation

Clay has four types of params: query keys, body keys, headers and route params (e.g. `:id`), these look like this:

```typescript
{
  name: 'search',
  description: '',
  type: 'query',
  required: 'YES'
}
```

Params are usually documented by default: for example, if using the `@Validate` decorator, the query, body and header keys specified in the validation schema are pulled through to the documentation. Route params are pulled in from the route path.

If you're using entities with requirements (via the `@Required` hook), all required properties are documented.

### Requirement types

Parameters can be always required, sometimes required or optional. The requirement type is pulled in from the source of the param's definition. E.g. if a `requiredIf` is specified for the param in a `@Validation` schema, then the param is marked as sometimes required. Otherwise, the requirement type is pulled in from the `required` key.

Route params are always marked as required.

### Descriptions

Param descriptions can be defined the same way that route descriptions are.

```typescript
@Route({
  docs: {
    description: 'Update a user',
    params: {
      route: {
        id: 'The id of the user'
      }
    }   
  }
})
async put(): Promise<void> {
  return {
    status: 204
  }
}
```

### Hidden routes

You can also hide routes by passing `hidden: true` to the `RouteDocs` object, preventing it from appearing in docuemtnation:

```typescript
@Route({
  docs: {
    hidden: true
  }
})
async put(): Promise<void> {
  return {
    status: 204
  }
}
```

## Samples

You can add example requests and responses using the `samples` key in the `RouteDocs`:

```typescript
@Route({
  method: 'POST',
  docs: {
    samples: [
      {
        title: 'Sample request',
        sample: {
          name: 'John Smith',
          password: 'p4ssw0rd'
        }
      },
      {
        title: 'Sample response',
        sample: {
          id: 1,
          name: 'John Smith',
          createdAt: '2022-01-01 02:22:16'
        }
      }
    ]
  }
})
```

A sample requires a title and a sample object.

## Practical usage

Documentation is stored inside the global `Clay` object and can be accessed via `globalThis.clay.docs`.

To always have up to date documentation, you could implement a route that simply returns the docs, which can then be read by a frontend:

```typescript
export default class DocumentationService extends Service {
  @Route({
    method: 'GET'
  })
  async index(): Promise<Response> {
    return {
      status: 200,
      body: {
        docs: globalThis.clay.docs
      }
    }
  }
}
```
