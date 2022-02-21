export default function deepFreeze<T>(obj: T): T {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Object.isFrozen(obj[key])) {
      deepFreezeProp(obj[key])
    }
  })

  return Object.freeze(obj) as T
}

function deepFreezeProp(obj: object): object {
  return Object.freeze(obj)
}
