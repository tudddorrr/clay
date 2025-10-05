import { describe, it, expect } from 'vitest'
import { setNested } from '../lib/utils/setNested'

describe('setNested', () => {
  it('should set a simple property', () => {
    const obj = {}
    setNested(obj, 'foo', 'bar')
    expect(obj).toEqual({ foo: 'bar' })
  })

  it('should create nested objects for dot paths', () => {
    const obj = {}
    setNested(obj, 'api.users.service', 'myService')
    expect(obj).toEqual({
      api: {
        users: {
          service: 'myService'
        }
      }
    })
  })

  it('should handle deeply nested paths', () => {
    const obj = {}
    setNested(obj, 'a.b.c.d.e.f', 'deep')
    expect(obj).toEqual({
      a: {
        b: {
          c: {
            d: {
              e: {
                f: 'deep'
              }
            }
          }
        }
      }
    })
  })

  it('should not overwrite existing intermediate objects', () => {
    const obj = {
      api: {
        existing: 'data'
      }
    }
    setNested(obj, 'api.users.service', 'myService')
    expect(obj).toEqual({
      api: {
        existing: 'data',
        users: {
          service: 'myService'
        }
      }
    })
  })

  it('should overwrite existing values at the target path', () => {
    const obj = {
      api: {
        users: {
          service: 'oldService'
        }
      }
    }
    setNested(obj, 'api.users.service', 'newService')
    expect(obj).toEqual({
      api: {
        users: {
          service: 'newService'
        }
      }
    })
  })

  it('should handle single-level paths', () => {
    const obj = { existing: 'value' }
    setNested(obj, 'new', 'data')
    expect(obj).toEqual({
      existing: 'value',
      new: 'data'
    })
  })
})
