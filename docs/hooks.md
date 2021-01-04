# Hooks

Out of the box, you get an `@Before` and `@After` hook that run before/after the decorated function. You also get an `@Validate` that can check a request's body and query parameters.

To enable decorators you'll need to add `"experimentalDecorators": true` into your `tsconfig.json`.

## Decorators
```
@Before(string | Function)

@After(string | Function)

@Validate(ValidationSchema)
```

## Calling functions

You can invoke functions either by passing a function or a string with the name of the function to call:

```
validate(hook: HookParams) { ... }

@Before('validate')
async get(req: ServiceRequest) { ... }

// OR

@Before((hook: HookParams) => { ... })
async get(req: ServiceRequest) { ... }
```

## HookParams

Hooks are called with a `HookParams` object containing:
- `args`: an array of arguments passed to the original function (i.e. `req: ServiceRequest`)
- `result`: passed to the `@After` hook containing the return value of the function
- `caller`: `this` context of the class (useful for calling another method in the class)

## Modifying requests

You can modify the value of request bodies using the `@Before` hook:

```
@Before((hook: HookParams): void => {
  const [req] = hook.args
  req.body.receivedAt = Date.now()
})
async post(req: ServiceRequest) { ... }
```

## Modifying responses

You can modify the response object by returning a value in the `@After` hook:

```
@After((hook: HookParams): void | ServiceResponse => {
  if (!hook.result.body) {
    return {
      status: 204
    }
  }
})
async get(req: ServiceRequest): Promise<ServiceResponse> {
  return {
    status: 200
  }
}

// status returned is 204
```

## Validating requests
You can validate keys in a request's `body` or `query`. If you return a string and the key doesn't exist, the string will be used as an error message for a 400 response.

You can also provide a function. If the function returns a string, a 400 with that error message will be returned, otherwise the decorated function will be executed.

```
@Validate({
  query: {
    count: 'Please provide how many users you want to return'
  }
})
async get(req: ServiceRequest): Promise<ServiceResponse> { ... }

...

@Validate({
  body: {
    username: 'Please provide a username',
    age: async (val: number, req: ServiceRequest) => {
      if (val < 13) {
        return 'User needs to be at least 13 years old to register'
      }
    }
  }
})
async post(req: ServiceRequest): Promise<ServiceResponse> { ... }
```
