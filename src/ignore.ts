import path from "node:path"
import fs from "node:fs/promises"
import { minimatch } from "minimatch"
import { pathExists } from "./fs-utils"

const IGNORE_FILENAME = ".scaffoldignore"

/**
 * Reads a `.scaffoldignore` file from the given directory and returns
 * the parsed patterns for filtering.
 *
 * Lines starting with `#` are comments. Empty lines are skipped.
 *
 * @param dir The directory to search for `.scaffoldignore`
 * @returns Array of glob patterns to ignore
 */
export async function loadIgnorePatterns(dir: string): Promise<string[]> {
  const ignorePath = path.resolve(dir, IGNORE_FILENAME)

  if (!(await pathExists(ignorePath))) {
    return []
  }

  const content = await fs.readFile(ignorePath, "utf-8")
  return parseIgnoreFile(content)
}

/**
 * Parses the contents of a `.scaffoldignore` file into glob patterns.
 * @internal
 */
export function parseIgnoreFile(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
}

/**
 * Filters a list of file paths, removing any that match the ignore patterns.
 * Patterns are matched against the relative path from baseDir.
 * Also always excludes `.scaffoldignore` itself.
 */
export function filterIgnoredFiles(
  files: string[],
  ignorePatterns: string[],
  baseDir: string,
): string[] {
  return files.filter((file) => {
    const basename = path.basename(file)
    if (basename === IGNORE_FILENAME) {
      return false
    }

    const relPath = path.relative(baseDir, file)

    for (const pattern of ignorePatterns) {
      if (
        minimatch(relPath, pattern, { dot: true }) ||
        minimatch(basename, pattern, { dot: true })
      ) {
        return false
      }
    }
    return true
  })
}
