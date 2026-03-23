import path from "node:path"

/** Strips glob wildcard characters from a template path. */
export function removeGlob(template: string): string {
  return path.normalize(template.replace(/\*/g, ""))
}

/** Removes a leading path separator, making the path relative. */
export function makeRelativePath(str: string): string {
  return str.startsWith(path.sep) ? str.slice(1) : str
}

/** Computes a base path relative to the current working directory. */
export function getBasePath(relPath: string): string {
  return path
    .resolve(process.cwd(), relPath)
    .replace(process.cwd() + path.sep, "")
    .replace(process.cwd(), "")
}
