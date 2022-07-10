export function getServiceKey(path: string) {
  return path.substring(1, path.length)
    .replace(/\/:(([A-Z]|[a-z])*)\//g, '/')
    .replace(/\//g, '.')
}
