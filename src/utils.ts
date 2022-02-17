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

export const defaultHelpers: Exclude<ScaffoldConfig["helpers"], undefined> = {
  camelCase,
  snakeCase,
  startCase,
  kebabCase,
  hyphenCase: kebabCase,
  pascalCase,
  lowerCase: (text) => text.toLowerCase(),
  upperCase: (text) => text.toUpperCase(),
}

export function registerHelpers(options: ScaffoldConfig) {
  const _helpers = { ...defaultHelpers, ...options.helpers }
  for (const helperName in _helpers) {
    log(options, LogLevel.Debug, `Registering helper: ${helperName}`)
    Handlebars.registerHelper(helperName, _helpers[helperName as keyof typeof _helpers])
  }
}

export function handleErr(err: NodeJS.ErrnoException | null) {
  if (err) throw err
}

export function log(options: ScaffoldConfig, level: LogLevel, ...obj: any[]) {
  if (options.quiet || options.verbose === LogLevel.None || level < (options.verbose ?? LogLevel.Info)) {
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
  const key: "log" | "warn" | "error" = level === LogLevel.Error ? "error" : level === LogLevel.Warning ? "warn" : "log"
  const logFn: any = console[key]
  logFn(
    ...obj.map((i) =>
      i instanceof Error
        ? chalkFn(i, JSON.stringify(i, undefined, 1), i.stack)
        : typeof i === "object"
        ? chalkFn(JSON.stringify(i, undefined, 1))
        : chalkFn(i)
    )
  )
}

export async function createDirIfNotExists(dir: string, options: ScaffoldConfig): Promise<void> {
  const parentDir = path.dirname(dir)

  if (!(await pathExists(parentDir))) {
    await createDirIfNotExists(parentDir, options)
  }

  if (!(await pathExists(dir))) {
    try {
      log(options, LogLevel.Debug, `Creating dir ${dir}`)
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
  options: ScaffoldConfig,
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
    path.dirname(handlebarsParse(options, filePath, data).toString()),
    path.basename(handlebarsParse(options, filePath, data).toString())
  )
}

export function handlebarsParse(
  options: ScaffoldConfig,
  templateBuffer: Buffer | string,
  data: Record<string, string>
) {
  try {
    const parser = Handlebars.compile(templateBuffer.toString(), { noEscape: true })
    const outputContents = parser(data)
    return outputContents
  } catch {
    log(options, LogLevel.Warning, "Couldn't parse file with handlebars, returning original content")
    return templateBuffer
  }
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

export function makeRelativePath(str: string): string {
  return str.startsWith("/") ? str.slice(1) : str
}
