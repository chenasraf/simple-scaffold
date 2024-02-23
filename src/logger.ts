import util from "util"
import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import chalk from "chalk"

export function log(config: LogConfig, level: LogLevel, ...obj: any[]): void {
  const priority: Record<LogLevel, number> = {
    [LogLevel.none]: 0,
    [LogLevel.debug]: 1,
    [LogLevel.info]: 2,
    [LogLevel.warning]: 3,
    [LogLevel.error]: 4,
  }

  if (config.logLevel === LogLevel.none || priority[level] < priority[config.logLevel ?? LogLevel.info]) {
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
          ? util.inspect(i, { depth: null, colors: true })
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
    subdir: config.subdir,
    data: config.data,
    overwrite: config.overwrite,
    subdirHelper: config.subdirHelper,
    helpers: Object.keys(config.helpers ?? {}),
    logLevel: config.logLevel,
    dryRun: config.dryRun,
    beforeWrite: config.beforeWrite,
  } as Record<keyof ScaffoldConfig, unknown>)
  log(config, LogLevel.info, "Data:", config.data)
}
