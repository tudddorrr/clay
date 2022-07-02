export function getServiceKey(path: string) {
  return path.substring(1, path.length).replace(/\//g, '.')
}
