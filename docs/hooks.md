# Hooks

Hooks run before/after functions in your services.

To enable decorators you'll need to add `"experimentalDecorators": true` into your `tsconfig.json`.

## @Before and @After

These hooks run before/after the decorated function is executed.

You can invoke functions either by passing a function or a string with the name of the function to call:

```
validate(hook: HookParams) { ... }

@Before('validate')
async get(req: Request) { ... }

// OR

@Before((hook: HookParams) => { ... })
async get(req: Request) { ... }
```

### HookParams

Hooks are called with a `HookParams` object containing:
- `req`: the `Request` passed to the handler
- `result`: passed to the `@After` hook containing the return value of the function
- `caller`: `this` context of the class (useful for calling another method in the class)

### Modifying requests

You can modify the value of request bodies using the `@Before` hook:

```
@Before((hook: HookParams): void => {
  const req: Request = hook.req
  req.body.receivedAt = Date.now()
})
async post(req: Request) { ... }
```

### Modifying responses

You can modify the response object by returning a value in the `@After` hook:

```
@After((hook: HookParams): void | Response => {
  if (!hook.result.body) {
    return {
      status: 204
    }
  }
})
async get(req: Request): Promise<Response> {
  return {
    status: 200
  }
}

// status returned is 204
```

## @Validate and @Required

[Docs for these hooks can be found here](https://github.com/tudddorrr/koa-rest-services/tree/main/docs/validation.md)

## @HasPermission

@HasPermission runs before your function to check if the endpoint can be called:

```
class SecretsPolicy extends Policy {
  async get(req: Request): Promise<PolicyResponse> {
    return this.ctx.user.hasScope('get')
  }

  async post(req: Request): Promise<PolicyResponse> {
    return this.ctx.user.hasScope('post')
  }
}

class SecretsService implements Service {
  @HasPermission(SecretsPolicy, 'get')
  async get(req: Request): Promise<Response> { ... }

  @HasPermission(SecretsPolicy, 'post')
  async post(req: Request): Promise<Response> { ... }
}
```

Policy classes should extend the `Policy` class which simply sets the Koa context (`ctx`) as a member variable. Beyond that, the implementation is totally up to you - you could check the `ctx.state` (if you're using `koa-jwt`) or even the request to make sure the required permissions are met.

### Custom denials

To override the default error code and message, return a `PolicyDenial`. This will pass any data you specify and the optional status code (defaulting to 403) to Koa's throw function.

```
async put(req: Request): Promise<PolicyResponse> {
  return new PolicyDenial({ message: 'Method not implemented yet. Come back later' }, 405)
}
```

### PolicyResponse

The `PolicyResponse` type is a union of the `boolean` and `PolicyDenial` types.
