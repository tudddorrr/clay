# Hooks

Hooks run before/after functions in your services.

To enable decorators you'll need to add `"experimentalDecorators": true` into your `tsconfig.json`.

## @Before and @After

These hooks run before/after the decorated function is executed.

You can invoke functions either by passing a function or a string with the name of the function to call:

```
validate(hook: HookParams) { ... }

@Before('validate')
async get(req: ServiceRequest) { ... }

// OR

@Before((hook: HookParams) => { ... })
async get(req: ServiceRequest) { ... }
```

### HookParams

Hooks are called with a `HookParams` object containing:
- `req`: the `ServiceRequest` passed to the handler
- `result`: passed to the `@After` hook containing the return value of the function
- `caller`: `this` context of the class (useful for calling another method in the class)

### Modifying requests

You can modify the value of request bodies using the `@Before` hook:

```
@Before((hook: HookParams): void => {
  const req: ServiceRequest = hook.req
  req.body.receivedAt = Date.now()
})
async post(req: ServiceRequest) { ... }
```

### Modifying responses

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

## @Validate
@Validate runs before your function. You can validate keys in a request's `body` or `query`. If you return a string and the key doesn't exist, the string will be used as an error message for a 400 response.

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

For more simple use cases, you can also provide the body and query keys an array:

```
@Validate({
  body: ['username', 'age']
})
async post(req: ServiceRequest): Promise<ServiceResponse> { ... }
```

If any of the keys are missing, the response will simply be: `Missing [body or query] key: [key name]`. In the case above, if there's no `username` provided, your response will be: `Missing body key: username`.

## @HasPermission
@HasPermission runs before your function to check if the endpoint can be called:

```
class SecretsServicePolicy extends ServicePolicy {
  async get(req: ServiceRequest): Promise<boolean> {
    return this.ctx.user.hasScope('get')
  }

  async post(req: ServiceRequest): Promise<boolean> {
    return this.ctx.user.hasScope('post')
  }
}

class SecretsService implements Service {
  @HasPermission(SecretsServicePolicy, 'get')
  async get(req: ServiceRequest): Promise<ServiceResponse> { ... }

  @HasPermission(SecretsServicePolicy, 'post')
  async post(req: ServiceRequest): Promise<ServiceResponse> { ... }
}
```

Policy classes should extend the `ServicePolicy` class which simply sets the Koa context (`ctx`) as a member variable. Beyond that, the implementation is totally up to you - you could check the `ctx.state` (if you're using `koa-jwt`) or even the request to make sure the required permissions are met.

### Custom denials

To override the default error code and message, return a `ServicePolicyDenial`. This will pass any data you specify and the optional status code (defaulting to 403) to Koa's throw function.

```
async put(req: ServiceRequest): Promise<boolean | ServicePolicyDenial> {
  return new ServicePolicyDenial({ message: 'Method not implemented yet. Come back later' }, 405)
}
```
