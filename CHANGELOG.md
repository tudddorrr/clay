# Changelog

## 2.0.0 (Unreleased)
Every change in 2.0.0 is breaking

* Removed the `@Resource` hook. The behaviour was iffy and the same functionality can (mostly) be achieved using `toJSON()`
* Renamed the `basePath` service config option to `prefix`
* Routes are now defined within the `routes` member variable of service classes
* The `index()` function of service classes is now called for `GET /` instead of `get()` (which now only gets called for `GET/:id`)
* Added the `ServicePolicyDenial` class for returning custom data and status codes with `@HasPermission`

## 1.0.0 (21st March 2021)
* Bump to 1.0.0 (the project feels feature-complete now)
* Can check headers with the `@Validate` hook

## 0.3.1 (6th Feb 2021)
* Use correct path when falling back to default route for method
* Don't handle methods if the defined routes don't include them

## 0.3.0 (3rd Feb 2021)
* (Breaking) Resources now need to implement an `async transform()` function to transform entities rather than doing it in the constructor

## 0.2.1 (2nd Feb 2021)
* Fixed exports for hook functions

## 0.2.0 (2nd Feb 2021)
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
