import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import { F_OK } from "node:constants"
import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import { log } from "./logger"

const { stat, access, mkdir } = fs

/** Recursively creates a directory and its parents if they don't exist. */
export async function createDirIfNotExists(
  dir: string,
  config: LogConfig & Pick<ScaffoldConfig, "dryRun">,
): Promise<void> {
  if (config.dryRun) {
    log(config, LogLevel.info, `Dry Run. Not creating dir ${dir}`)
    return
  }
  const parentDir = path.dirname(dir)

  if (!(await pathExists(parentDir))) {
    await createDirIfNotExists(parentDir, config)
  }

  if (!(await pathExists(dir))) {
    try {
      log(config, LogLevel.debug, `Creating dir ${dir}`)
      await mkdir(dir)
      return
    } catch (e: unknown) {
      if (e && (e as NodeJS.ErrnoException).code !== "EEXIST") {
        throw e
      }
      return
    }
  }
}

/** Checks whether a file or directory exists at the given path. */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, F_OK)
    return true
  } catch (e: unknown) {
    if (e && (e as NodeJS.ErrnoException).code === "ENOENT") {
      return false
    }
    throw e
  }
}

/** Returns true if the given path is a directory. */
export async function isDir(dirPath: string): Promise<boolean> {
  const tplStat = await stat(dirPath)
  return tplStat.isDirectory()
}

/** Generates a unique temporary directory path for scaffold operations. @internal */
export function getUniqueTmpPath(): string {
  return path.resolve(
    os.tmpdir(),
    `scaffold-config-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
}
