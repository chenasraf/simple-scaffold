import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import chalk from "chalk"

export function log(config: LogConfig, level: LogLevel, ...obj: any[]): void {
  if (config.quiet || config.verbose === LogLevel.None || level < (config.verbose ?? LogLevel.Info)) {
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
  log(config, LogLevel.Debug, data)
}

export function logInitStep(config: ScaffoldConfig): void {
  log(config, LogLevel.Debug, "Full config:", {
    name: config.name,
    templates: config.templates,
    output: config.output,
    createSubFolder: config.createSubFolder,
    data: config.data,
    overwrite: config.overwrite,
    quiet: config.quiet,
    subFolderNameHelper: config.subFolderNameHelper,
    helpers: Object.keys(config.helpers ?? {}),
    verbose: `${config.verbose} (${Object.keys(LogLevel).find(
      (k) => (LogLevel[k as any] as unknown as number) === config.verbose!,
    )})`,
    dryRun: config.dryRun,
    beforeWrite: config.beforeWrite,
  } as Record<keyof ScaffoldConfig, unknown>)
  log(config, LogLevel.Info, "Data:", config.data)
}
