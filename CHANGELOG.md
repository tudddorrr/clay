# Changelog

## Unreleased
* Add `matchedRoute` (e.g. `/users/:id/comments`)  and `matchedServiceKey` (e.g. `api.users.comments`) into the context state
* Fix documenting entities with complex constructors that use `@Required`

## 6.4.0 (16th July 2022)
* `@Validate` and `@Required` will now only check for `undefined` and will not count `null` properties as missing

## 6.3.0 (11th July 2022)
* Registered services are now accessed under `ctx.state.services[your-path].service` (previously `ctx.state.services[your-path]`) to support base paths and nested paths
* Fix the `@ForwardTo` decorator not supporting nested routes

## 6.2.2 (10th July 2022)
* Handle registering nested service paths (e.g. `service('/api/:version/users/:userId/comments')` => `api.users.comments`)

## 6.2.1 (8th July 2022)
* Use `hasOwnProperty()` instead of invoking handlers to check implict routes are implemented

## 6.2.0 (6th July 2022)
* Fix `@Docs` overriding the `required` type on params
* Added `samples` to `RouteDocs` for documenting multiple route request/response samples

## 6.1.2 (4th July 2022)
* Don't override docs of a route that forwards to another route
* Fix route params not being documented

## 6.1.1 (3rd July 2022)
* Use context of forwarded-to service for forwarded requests

## 6.1.0 (2nd July 2022)
* Added `@ForwardTo` decorator and `forwardRequest()` helper for forwarding requests between services
* Documentation from forward-to handlers is applied to the handler that forwarded the request

## 6.0.0 (30th June 2022)
* The `Service` interface is now a class and should be extended rather than implemented
* Implicit route methods (`index()`, `post()`, etc) are now defined in the `Service` base class and by default return a 405 - method not allowed
* Added [automatic documentation](https://github.com/tudddorrr/clay/tree/main/docs/documenter.md) - available via the Clay global object: `globalThis.clay.docs`
* Added `@Docs` decorator for documenting service routes
* Request headers are now strictly typed to `string` instead of `any`

## 5.3.0 (25th May 2022)
* Route handlers can now return a `RedirectResponse` type
* Added `redirect()` helper function for creating redirects

## 5.2.1 (5th Mar 2022)
* Support classes in @Validate that have parameters in their constructors

## 5.2.0 (24th February 2022)
* Add `break` to validation condition, if set to true than any later errors for that key are not added to the response
* `Request` and `Response` objects and their properties are now `readonly` (apart from the context state)

## 5.1.1 (22nd February 2022)
* Keep Koa context unfrozen in @Before/@After

## 5.1.0 (21st February 2022)
* Add new reworked @Before/@After [see the docs](https://github.com/tudddorrr/clay/tree/main/docs/before-after.md)

## 5.0.0 (19th February 2022)
* New name: Clay!
* Remove `Service` prefix from all types and interfaces (e.g. ServiceRequest -> Request)
* Added @Required decorator for entity properties
* Reworked how the @Validate object schema works, [see the docs](https://github.com/tudddorrr/clay/tree/main/docs/validation.md)
* Removed the @Before and @After decorators
* Move registered services into `ctx.state`
* Made koa-bodyparser a dependency

## 4.0.3 (15th November 2021)
* Only reject null or undefined values in `@Validate` schemas

## 4.0.2 (6th November 2021)
* Fix type of `ServiceRequest.path`

## 4.0.1 (16th October 2021)
* Added export for `ServicePolicyResponse`, returning a union type for `boolean` and `ServicePolicyDenial`

## 4.0.0 (20th September 2021)
* Route base paths are now declared in the middleware declaration
* Services are now registered with lodash.set allowing for namespaced access

## 3.1.x (18th July 2021)
* (3.1.0) Add @Routes decorator for declaring routes
* (3.1.1) Fix missing export for new decorator

## 3.0.x (23rd June 2021)
* (3.0.0) Reworked the way `@Validate` works:
* (3.0.0) Keys that return a function must now return a boolean (false => fail, true => pass)
* (3.0.0) Keys that return a function must now throw an error to override the default message (see the docs)
* (3.0.1) Fix typing on `val` parameter of validation functions

## 2.1.0 (21st June 2021)
* Validation schemas for `@Validate` can now take in booleans to specify whether the key is required

## 2.0.2 (6th June 2021)
* `ServicePolicyDenial`'s status code defaults to 403 instead of 401

## 2.0.0 (6th June 2021)
Every change in 2.0.0 is breaking

* Removed the `@Resource` hook. The behaviour was iffy and the same functionality can (mostly) be achieved using `toJSON()`
* Renamed the `basePath` service config option to `prefix`
* Routes are now defined within the `routes` member variable of service classes
* The `index()` function of service classes is now called for `GET /` instead of `get()` (which now only gets called for `GET/:id`)
* Added the `ServicePolicyDenial` class for returning custom data and status codes with `@HasPermission`

## 1.0.0 (21st March 2021)
* Bump to 1.0.0 (the project feels feature-complete now)
* Can check headers with the `@Validate` hook

## 0.3.1 (6th February 2021)
* Use correct path when falling back to default route for method
* Don't handle methods if the defined routes don't include them

## 0.3.0 (3rd February 2021)
* (Breaking) Resources now need to implement an `async transform()` function to transform entities rather than doing it in the constructor

## 0.2.1 (2nd February 2021)
* Fixed exports for hook functions

## 0.2.0 (2nd February 2021)
* Set type of query params to `string` instead of `any`
* Added `@HasPermission` hook for checking requests against policy classes 

## 0.1.0 (20th Jan 2021)
* (Breaking) `HookParams` now exposes the `req: ServiceRequest` of the handler instead of the `args`

## 0.0.10 (19th Jan 2021)
* Handle `@After` and `@Before` hooks if they're async functions

## 0.0.9 (17th Jan 2021)

* (Tests) Fix questionable usage of 204
* `@Validate`'s body and query keys can now accept an array that will simply check if the keys in the array exist on the body or query

## 0.0.8 (6th Jan 2021)

* Don't run `@Resource` hook on missing keys
* (Debug) Better logging for when route/handler can't be found

## 0.0.7 (5th Jan 2021)

* Added `@Resource` hook for transforming objects before being returned in responses
* (Debug) Better logging for available routes

## 0.0.6 (4th Jan 2021)

* Added `@Validation` hook for making sure request isn't missing required data

## 0.0.3 - 0.0.5 (3rd Jan 2021)

* Handle undefined route path gracefully
* Add `debug` option for logging
* Drop generic declaration on Service
* Clean up package contents
* Register services directly to the app context (accessible via `app.context.services`)

## 0.0.2 (2nd Jan 2021)

* Route handlers can be functions
