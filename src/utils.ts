import path from "path"
import { F_OK } from "constants"
import {
  DefaultHelpers,
  FileResponse,
  FileResponseHandler,
  Helper,
  LogLevel,
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigFile,
} from "./types"
import camelCase from "lodash/camelCase"
import snakeCase from "lodash/snakeCase"
import kebabCase from "lodash/kebabCase"
import startCase from "lodash/startCase"
import Handlebars from "handlebars"
import { promises as fsPromises } from "fs"
import chalk from "chalk"
const { stat, access, mkdir } = fsPromises
import dtAdd from "date-fns/add"
import dtFormat from "date-fns/format"
import dtParseISO from "date-fns/parseISO"
import { glob, hasMagic } from "glob"
import { OptionsBase } from "massarg/types"
import { spawn } from "node:child_process"
import os from "node:os"

const dateFns = {
  add: dtAdd,
  format: dtFormat,
  parseISO: dtParseISO,
}

const { readFile, writeFile } = fsPromises

export const defaultHelpers: Record<DefaultHelpers, Helper> = {
  camelCase,
  snakeCase,
  startCase,
  kebabCase,
  hyphenCase: kebabCase,
  pascalCase,
  lowerCase: (text) => text.toLowerCase(),
  upperCase: (text) => text.toUpperCase(),
  now: nowHelper,
  date: dateHelper,
}

export function _dateHelper(date: Date, formatString: string): string
export function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string
export function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration,
): string {
  if (durationType && durationDifference !== undefined) {
    return dateFns.format(dateFns.add(date, { [durationType]: durationDifference }), formatString)
  }
  return dateFns.format(date, formatString)
}

export function nowHelper(formatString: string): string
export function nowHelper(formatString: string, durationDifference: number, durationType: keyof Duration): string
export function nowHelper(formatString: string, durationDifference?: number, durationType?: keyof Duration): string {
  return _dateHelper(new Date(), formatString, durationDifference!, durationType!)
}

export function dateHelper(date: string, formatString: string): string
export function dateHelper(
  date: string,
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string

export function dateHelper(
  date: string,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration,
): string {
  return _dateHelper(dateFns.parseISO(date), formatString, durationDifference!, durationType!)
}

export function registerHelpers(config: ScaffoldConfig): void {
  const _helpers = { ...defaultHelpers, ...config.helpers }
  for (const helperName in _helpers) {
    log(config, LogLevel.Debug, `Registering helper: ${helperName}`)
    Handlebars.registerHelper(helperName, _helpers[helperName as keyof typeof _helpers])
  }
}

export function handleErr(err: NodeJS.ErrnoException | null): void {
  if (err) throw err
}

/** @internal */
export type LogConfig = Pick<ScaffoldConfig, "quiet" | "verbose">

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

export async function createDirIfNotExists(dir: string, config: ScaffoldConfig): Promise<void> {
  const parentDir = path.dirname(dir)

  if (!(await pathExists(parentDir))) {
    await createDirIfNotExists(parentDir, config)
  }

  if (!(await pathExists(dir))) {
    try {
      log(config, LogLevel.Debug, `Creating dir ${dir}`)
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
  config: ScaffoldConfig,
  filePath: string,
  fn: FileResponse<T>,
  defaultValue?: T,
): T {
  if (typeof fn !== "function") {
    return defaultValue ?? (fn as T)
  }
  return (fn as FileResponseHandler<T>)(
    filePath,
    path.dirname(handlebarsParse(config, filePath, { isPath: true }).toString()),
    path.basename(handlebarsParse(config, filePath, { isPath: true }).toString()),
  )
}

export function handlebarsParse(
  config: ScaffoldConfig,
  templateBuffer: Buffer | string,
  { isPath = false }: { isPath?: boolean } = {},
): Buffer {
  const { data } = config
  try {
    let str = templateBuffer.toString()
    if (isPath) {
      str = str.replace(/\\/g, "/")
    }
    const parser = Handlebars.compile(str, { noEscape: true })
    let outputContents = parser(data)
    if (isPath && path.sep !== "/") {
      outputContents = outputContents.replace(/\//g, "\\")
    }
    return Buffer.from(outputContents)
  } catch (e) {
    log(config, LogLevel.Debug, e)
    log(config, LogLevel.Warning, "Couldn't parse file with handlebars, returning original content")
    return Buffer.from(templateBuffer)
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

export function removeGlob(template: string): string {
  return template.replace(/\*/g, "").replace(/(\/\/|\\\\)/g, path.sep)
}

export function makeRelativePath(str: string): string {
  return str.startsWith(path.sep) ? str.slice(1) : str
}

export function getBasePath(relPath: string): string {
  return path
    .resolve(process.cwd(), relPath)
    .replace(process.cwd() + path.sep, "")
    .replace(process.cwd(), "")
}

export async function getFileList(_config: ScaffoldConfig, template: string): Promise<string[]> {
  return (
    await glob(template, {
      dot: true,
      nodir: true,
      // debug: config.verbose === LogLevel.Debug,
    })
  ).map(path.normalize)
}

export interface GlobInfo {
  nonGlobTemplate: string
  origTemplate: string
  isDirOrGlob: boolean
  isGlob: boolean
  template: string
}

export async function getTemplateGlobInfo(config: ScaffoldConfig, template: string): Promise<GlobInfo> {
  const isGlob = hasMagic(template)
  log(config, LogLevel.Debug, "before isDir", "isGlob:", isGlob, template)
  let _template = template
  let nonGlobTemplate = isGlob ? removeGlob(template) : template
  nonGlobTemplate = path.normalize(nonGlobTemplate)
  const isDirOrGlob = isGlob ? true : await isDir(template)
  log(config, LogLevel.Debug, "after isDir", isDirOrGlob)
  const _shouldAddGlob = !isGlob && isDirOrGlob
  const origTemplate = template
  if (_shouldAddGlob) {
    _template = path.join(template, "**", "*")
  }
  return { nonGlobTemplate, origTemplate, isDirOrGlob, isGlob, template: _template }
}

export interface OutputFileInfo {
  inputPath: string
  outputPathOpt: string
  outputDir: string
  outputPath: string
  exists: boolean
}

export async function getTemplateFileInfo(
  config: ScaffoldConfig,
  { templatePath, basePath }: { templatePath: string; basePath: string },
): Promise<OutputFileInfo> {
  const inputPath = path.resolve(process.cwd(), templatePath)
  const outputPathOpt = getOptionValueForFile(config, inputPath, config.output)
  const outputDir = getOutputDir(config, outputPathOpt, basePath)
  const outputPath = handlebarsParse(config, path.join(outputDir, path.basename(inputPath)), {
    isPath: true,
  }).toString()
  const exists = await pathExists(outputPath)
  return { inputPath, outputPathOpt, outputDir, outputPath, exists }
}

export async function copyFileTransformed(
  config: ScaffoldConfig,
  {
    exists,
    overwrite,
    outputPath,
    inputPath,
  }: {
    exists: boolean
    overwrite: boolean
    outputPath: string
    inputPath: string
  },
): Promise<void> {
  if (!exists || overwrite) {
    if (exists && overwrite) {
      log(config, LogLevel.Info, `File ${outputPath} exists, overwriting`)
    }
    const templateBuffer = await readFile(inputPath)
    const unprocessedOutputContents = handlebarsParse(config, templateBuffer)
    const finalOutputContents =
      (await config.beforeWrite?.(unprocessedOutputContents, templateBuffer, outputPath)) ?? unprocessedOutputContents

    if (!config.dryRun) {
      await writeFile(outputPath, finalOutputContents)
      log(config, LogLevel.Info, "Done.")
    } else {
      log(config, LogLevel.Info, "Content output:")
      log(config, LogLevel.Info, finalOutputContents)
    }
  } else if (exists) {
    log(config, LogLevel.Info, `File ${outputPath} already exists, skipping`)
  }
}

export function getOutputDir(config: ScaffoldConfig, outputPathOpt: string, basePath: string): string {
  return path.resolve(
    process.cwd(),
    ...([
      outputPathOpt,
      basePath,
      config.createSubFolder
        ? config.subFolderNameHelper
          ? handlebarsParse(config, `{{ ${config.subFolderNameHelper} name }}`).toString()
          : config.name
        : undefined,
    ].filter(Boolean) as string[]),
  )
}

export function logInputFile(
  config: ScaffoldConfig,
  {
    origTemplate,
    relPath,
    template,
    inputFilePath,
    nonGlobTemplate,
    basePath,
    isDirOrGlob,
    isGlob,
  }: {
    origTemplate: string
    relPath: string
    template: string
    inputFilePath: string
    nonGlobTemplate: string
    basePath: string
    isDirOrGlob: boolean
    isGlob: boolean
  },
): void {
  log(
    config,
    LogLevel.Debug,
    `\nprocess.cwd(): ${process.cwd()}`,
    `\norigTemplate: ${origTemplate}`,
    `\nrelPath: ${relPath}`,
    `\ntemplate: ${template}`,
    `\ninputFilePath: ${inputFilePath}`,
    `\nnonGlobTemplate: ${nonGlobTemplate}`,
    `\nbasePath: ${basePath}`,
    `\nisDirOrGlob: ${isDirOrGlob}`,
    `\nisGlob: ${isGlob}`,
    `\n`,
  )
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

export function parseAppendData(value: string, options: ScaffoldCmdConfig & OptionsBase): unknown {
  const data = options.data ?? {}
  const [key, val] = value.split(/\:?=/)
  // raw
  if (value.includes(":=") && !val.includes(":=")) {
    return { ...data, [key]: JSON.parse(val) }
  }
  return { ...data, [key]: isWrappedWithQuotes(val) ? val.substring(1, val.length - 1) : val }
}

function isWrappedWithQuotes(string: string): boolean {
  return (string.startsWith('"') && string.endsWith('"')) || (string.startsWith("'") && string.endsWith("'"))
}

/** @internal */
export async function parseConfig(config: ScaffoldCmdConfig & OptionsBase): Promise<ScaffoldConfig> {
  let c: ScaffoldConfig = config
  if (config.github) {
    log(config, LogLevel.Info, `Loading config from github ${config.github}`)
    const gitUrl = new URL(`https://github.com/${config.github}`)
    if (!gitUrl.pathname.endsWith(".git")) {
      gitUrl.pathname += ".git"
    }
    config.config = gitUrl.toString()
  }

  if (config.config) {
    const isUrl = config.config.includes("://")

    const hasColonToken = (!isUrl && config.config.includes(":")) || (isUrl && count(config.config, ":") > 1)
    const colonIndex = config.config.lastIndexOf(":")
    const [configFile, templateKey = "default"] = hasColonToken
      ? [config.config.substring(0, colonIndex), config.config.substring(colonIndex + 1)]
      : [config.config, undefined]
    const key = (config.key ?? templateKey) || "default"
    log(config, LogLevel.Info, `Loading config from ${configFile} with key ${key}`)
    const configImport = await getConfig({ config: configFile, quiet: config.quiet, verbose: config.verbose })
    if (!configImport[key]) {
      throw new Error(`Template "${key}" not found in ${configFile}`)
    }
    c = {
      ...config,
      ...configImport[key],
      data: {
        ...configImport[key].data,
        ...config.data,
      },
    }
  }

  c.data = { ...c.data, ...config.appendData }
  delete config.appendData
  return c
}

/** @internal */
export async function getConfig(
  config: Pick<ScaffoldCmdConfig, "quiet" | "verbose" | "config">,
): Promise<ScaffoldConfigFile> {
  const { config: configFile, ...logConfig } = config as Required<typeof config>
  const url = new URL(configFile)

  if (url.protocol === "file:") {
    log(logConfig, LogLevel.Info, `Loading config from file ${configFile}`)
    const absolutePath = path.resolve(process.cwd(), configFile)
    return import(absolutePath)
  }

  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (isHttp || isGit) {
    if (isGit) {
      const repoUrl = `${url.protocol}//${url.host}${url.pathname}`
      log(logConfig, LogLevel.Info, `Cloning git repo ${repoUrl}`)
      const tmpPath = path.resolve(os.tmpdir(), `scaffold-config-${Date.now()}`)

      return new Promise((resolve, reject) => {
        const clone = spawn("git", ["clone", "--depth", "1", repoUrl, tmpPath])

        clone.on("error", reject)
        clone.on("close", async (code) => {
          if (code === 0) {
            log(logConfig, LogLevel.Info, `Loading config from git repo: ${repoUrl}`)
            const hashPath = url.hash?.replace("#", "") || "scaffold.config.js"
            const absolutePath = path.resolve(tmpPath, hashPath)
            const loadedConfig = (await import(absolutePath)).default as ScaffoldConfigFile
            log(logConfig, LogLevel.Info, `Loaded config from git`)
            log(logConfig, LogLevel.Debug, `Raw config:`, loadedConfig)
            const fixedConfig: ScaffoldConfigFile = Object.fromEntries(
              Object.entries(loadedConfig).map(([k, v]) => [
                k,
                // use absolute paths for template as config is necessarily in another directory
                { ...v, templates: v.templates.map((t) => path.resolve(tmpPath, t)) },
              ]),
            )

            resolve(fixedConfig)
          } else {
            reject(new Error(`Git clone failed with code ${code}`))
          }
        })
      })
    }

    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return import(path.resolve(process.cwd(), configFile))
}

function count(string: string, substring: string): number {
  return string.split(substring).length - 1
}
