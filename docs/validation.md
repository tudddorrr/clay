# Validation

## @Validate

@Validate runs before your function. You can validate keys in a request's `body`, `query` or `headers`.
When validation fails, an error object will be returned in the response body with a 400 status code:

```typescript
{
  errors: {
    username: ['username is missing from the request'],
    signUpTime: ['signUpTime must be a valid date', 'signUpTime must be in the format yyyy-mm-dd']
  }
}
```

There are two ways to define validation with this decorator:

### Array schema

The array schema is a simple way to define required keys:

```typescript
@Validate({
  body: ['username', 'age'],
})
async post(req: Request): Promise<Response> { ... }
```

If any of the keys are missing (i.e. undefined), validation will fail.

You can additionally pass in a class type to automatically validate any properties decorated with @Required():

```typescript
import User from '../entities/user'

@Validate({
  body: [User, 'signUpTime'],
})
async post(req: Request): Promise<Response> { ... }
```

The advantage of this is that you can keep complex validation rules inside your entities without cluttering your services.

### Object schema

The object schema allows you to have greater control over your validation rules. 

```typescript
@Validate({
  body: {
    username: {
      required: true,
      error: 'username is a required field'
    }
  },
})
async post(req: Request): Promise<Response> { ... }
```

Using the object schema you can define custom error messages for when a key is missing. Additionally you can specify if a key is required using the `required` property or the `requiredIf` callback:

```typescript
@Validate({
  body: {
    email: {
      requiredIf: async (req: Request) => !req.body.username,
      error: 'An email is required if a username is not set'
    }
    username: {
      requiredIf: async (req: Request) => !req.body.email,
      error: 'A username is required if an email is not set'
    }
  },
})
async post(req: Request): Promise<Response> { ... }
```

Note: if you provide both a `required` and a `requiredIf`, the `required` will take precedence therefore you should choose between one or the other.

You can also perform multiple validation checks on a key. These will run if the key is present, regardless if it is required or not:

```typescript
@Validate({
  body: {
    email: {
      validation: async (val: unknown, req: Request): Promise<ValidationCondition[]> => [
        {
          check: Boolean(val),
          error: 'Email is a required field'
        },
        {
          check: val?.includes('@'),
          error: 'Please provide a valid email address'
        }
      ]
    }
  }
})
async post(req: Request): Promise<Response> { ... }
```

If multiple conditions fail they will all be present in the error object, for example if an email is not provided above, the error response will look like this:

```typescript
{
  errors: {
    email: [
      'Email is a required field',
      'Please provide a valid email address'
    ]
  }
}
```

You can also add a `break` key to your validation conditions. If this is set to `true` and the check fails, no further errors will be added to the errors array:

```typescript
@Validate({
  body: {
    email: {
      validation: async (val: unknown, req: Request): Promise<ValidationCondition[]> => [
        {
          check: Boolean(val),
          error: 'Email is a required field',
          break: true
        },
        // the check below will not run if the check above fails
        {
          check: val?.includes('@'),
          error: 'Please provide a valid email address'
        }
      ]
    }
  }
})
```

## @Required

@Required extends the @Validate object schema above and allows you to easily map between a request and an entity's expected properties.

By default, if a property is decorated with @Required, it will be required on POST and PUT requests. You can also specify a `methods` array to control this:

```typescript
class User {
  @Required({ methods: ['PUT', 'PATCH'] }) // required for PUT and PATCH requests
  id: number

  @Required() // required for POST and PUT requests
  name: string

  @Required({ methods: ['PATCH'] }) // required for PATCH requests
  termsAccepted: boolean
}
```

Sometimes your request body may have keys that are used to determine other keys, for example an id that may be a foreign key to another table. The `as` key allows you to handle these situations:

```typescript
class User {
  id: number

  @Required()
  name: string

  @Required({ as: 'companyId' }) // PUT/POST requests must have a `companyId` key
  company: Company
}
```

As mentioned above, this decorator extends @Validate's object schema so you can use `requiredIf` and `validation`:

```typescript
class User {
  id: number

  @Required({
    requiredIf: (req: Request) => !req.body.email,
    error: 'A username is required if an email is not set'
  })
  username: string

  @Required({
    requiredIf: (req: Request) => !req.body.username,
    error: 'An email is required if a username is not set',
    validation: async (val: unknown, req: Request): Promise<ValidationCondition[]> => [
        {
          check: val?.includes('@'),
          error: 'Please provide a valid email address'
        }
      ]
  })
  email: string
}
```

The `requiredIf` callback will always take precedence over the `methods` key so if the request HTTP method matches but the `requiredIf` resolves to false then the key will _not_ be required.
