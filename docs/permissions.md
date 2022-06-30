# @HasPermission

@HasPermission runs before your function to check if the endpoint can be called:

```
class SecretsPolicy extends Policy {
  async get(req: Request): Promise<PolicyResponse> {
    return req.ctx.user.hasScope('get')
  }

  async post(req: Request): Promise<PolicyResponse> {
    return req.ctx.user.hasScope('post')
  }
}

class SecretService extends Service {
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
