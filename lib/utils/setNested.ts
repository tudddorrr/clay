export function setNested<T>(obj: Record<string, any>, path: string, value: T): void {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part]) {
      current[part] = {}
    }
    current = current[part]
  }

  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}
