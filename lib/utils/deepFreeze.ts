export default function deepFreeze<T>(obj: T, excludedPaths: string[] = []): T {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Object.isFrozen(obj[key])) {
      deepFreezeProp(obj[key], excludedPaths, key)
    }
  })

  return Object.freeze(obj) as T
}

function deepFreezeProp(obj: object, excludedPaths: string[], currentPath: string): object {
  if (excludedPaths.includes(currentPath)) return obj

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Object.isFrozen(obj[key])) {
      deepFreezeProp(obj[key], excludedPaths, `${currentPath}.${key}`)
    }
  })

  return Object.freeze(obj)
}
