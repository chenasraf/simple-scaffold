import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import chalk from "chalk"

export function log(config: LogConfig, level: LogLevel, ...obj: any[]): void {
  if (config.logLevel === LogLevel.none || level < (config.logLevel ?? LogLevel.info)) {
    return
  }

  const levelColor: Record<keyof typeof LogLevel, keyof typeof chalk> = {
    [LogLevel.none]: "reset",
    [LogLevel.debug]: "blue",
    [LogLevel.info]: "dim",
    [LogLevel.warning]: "yellow",
    [LogLevel.error]: "red",
  }

  const chalkFn: any = chalk[levelColor[level]]
  const key: "log" | "warn" | "error" = level === LogLevel.error ? "error" : level === LogLevel.warning ? "warn" : "log"
  const logFn: any = console[key]
  logFn(
    ...obj.map((i) =>
      i instanceof Error
        ? chalkFn(i, JSON.stringify(i, undefined, 1), i.stack)
        : typeof i === "object"
          ? chalkFn(JSON.stringify(i, undefined, 1))
          : chalkFn(i),
    ),
  )
}

export function logInputFile(
  config: ScaffoldConfig,
  data: {
    originalTemplate: string
    relativePath: string
    parsedTemplate: string
    inputFilePath: string
    nonGlobTemplate: string
    basePath: string
    isDirOrGlob: boolean
    isGlob: boolean
  },
): void {
  log(config, LogLevel.debug, data)
}

export function logInitStep(config: ScaffoldConfig): void {
  log(config, LogLevel.debug, "Full config:", {
    name: config.name,
    templates: config.templates,
    output: config.output,
    createSubFolder: config.createSubFolder,
    data: config.data,
    overwrite: config.overwrite,
    subFolderNameHelper: config.subFolderNameHelper,
    helpers: Object.keys(config.helpers ?? {}),
    logLevel: config.logLevel,
    dryRun: config.dryRun,
    beforeWrite: config.beforeWrite,
  } as Record<keyof ScaffoldConfig, unknown>)
  log(config, LogLevel.info, "Data:", config.data)
}
