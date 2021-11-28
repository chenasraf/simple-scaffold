import path from "path"
import { F_OK } from "constants"
import { FileResponse, FileResponseFn, LogLevel, ScaffoldConfig } from "./types"
import camelCase from "lodash/camelCase"
import snakeCase from "lodash/snakeCase"
import kebabCase from "lodash/kebabCase"
import startCase from "lodash/startCase"
import Handlebars from "handlebars"
import { promises as fsPromises } from "fs"
import chalk from "chalk"
const { stat, access, mkdir } = fsPromises

const helpers = {
  camelCase,
  snakeCase,
  startCase,
  kebabCase,
  hyphenCase: kebabCase,
  pascalCase,
}

for (const helperName in helpers) {
  Handlebars.registerHelper(helperName, helpers[helperName as keyof typeof helpers])
}

export function handleErr(err: NodeJS.ErrnoException | null) {
  if (err) throw err
}

export function log(options: ScaffoldConfig, level: LogLevel, ...obj: any[]) {
  if (options.quiet || options.verbose === LogLevel.None || (options.verbose ?? LogLevel.Info) > level) {
    return
  }
  const levelColor: Record<LogLevel, keyof typeof chalk> = {
    [LogLevel.None]: "reset",
    [LogLevel.Debug]: "blue",
    [LogLevel.Info]: "dim",
    [LogLevel.Warning]: "yellow",
    [LogLevel.Error]: "red",
  }
  const chalkFn: any = chalk[levelColor[level]]
  console["log"](...obj.map((i) => (typeof i === "object" ? chalkFn(JSON.stringify(i, undefined, 1)) : chalkFn(i))))
  // console["log"](...obj)
}

export async function createDirIfNotExists(dir: string, options: ScaffoldConfig): Promise<void> {
  const parentDir = path.dirname(dir)

  if (!(await pathExists(parentDir))) {
    await createDirIfNotExists(parentDir, options)
  }

  if (!(await pathExists(dir))) {
    try {
      await mkdir(dir)
      return
    } catch (e: any) {
      if (e.code !== "EEXIST") {
        throw e
      }
      return
    }
  }
}

export function getOptionValueForFile<T>(
  filePath: string,
  data: Record<string, string>,
  fn: FileResponse<T>,
  defaultValue?: T
): T {
  if (typeof fn !== "function") {
    return defaultValue ?? (fn as T)
  }
  return (fn as FileResponseFn<T>)(
    filePath,
    path.dirname(handlebarsParse(filePath, data)),
    path.basename(handlebarsParse(filePath, data))
  )
}

export function handlebarsParse(templateBuffer: Buffer | string, data: Record<string, string>) {
  const parser = Handlebars.compile(templateBuffer.toString(), { noEscape: true })
  const outputContents = parser(data)
  return outputContents
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, F_OK)
    return true
  } catch (e: any) {
    if (e.code === "ENOENT") {
      return false
    }
    throw e
  }
}

export function pascalCase(s: string): string {
  return startCase(s).replace(/\s+/g, "")
}

export async function isDir(path: string): Promise<boolean> {
  const tplStat = await stat(path)
  return tplStat.isDirectory()
}

export function removeGlob(template: string) {
  return template.replace(/\*/g, "").replace(/\/\//g, "/")
}
