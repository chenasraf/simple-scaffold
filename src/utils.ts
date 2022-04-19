import path from "path"
import { F_OK } from "constants"
import { DefaultHelperKeys, FileResponse, FileResponseFn, Helper, LogLevel, ScaffoldConfig } from "./types"
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

const dateFns = {
  add: dtAdd,
  format: dtFormat,
  parseISO: dtParseISO,
}

import { glob } from "glob"
import { promisify } from "util"
const { readFile, writeFile } = fsPromises

export const defaultHelpers: Record<DefaultHelperKeys, Helper> = {
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
  durationType: keyof Duration
): string
export function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration
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
  durationType: keyof Duration
): string

export function dateHelper(
  date: string,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration
): string {
  return _dateHelper(dateFns.parseISO(date), formatString, durationDifference!, durationType!)
}

export function registerHelpers(options: ScaffoldConfig): void {
  const _helpers = { ...defaultHelpers, ...options.helpers }
  for (const helperName in _helpers) {
    log(options, LogLevel.Debug, `Registering helper: ${helperName}`)
    Handlebars.registerHelper(helperName, _helpers[helperName as keyof typeof _helpers])
  }
}

export function handleErr(err: NodeJS.ErrnoException | null): void {
  if (err) throw err
}

export function log(options: ScaffoldConfig, level: LogLevel, ...obj: any[]): void {
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
  fn: FileResponse<T>,
  defaultValue?: T
): T {
  if (typeof fn !== "function") {
    return defaultValue ?? (fn as T)
  }
  return (fn as FileResponseFn<T>)(
    filePath,
    path.dirname(handlebarsParse(options, filePath, { isPath: true }).toString()),
    path.basename(handlebarsParse(options, filePath, { isPath: true }).toString())
  )
}

export function handlebarsParse(
  options: ScaffoldConfig,
  templateBuffer: Buffer | string,
  { isPath = false }: { isPath?: boolean } = {}
): Buffer {
  const { data } = options
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
    log(options, LogLevel.Debug, e)
    log(options, LogLevel.Warning, "Couldn't parse file with handlebars, returning original content")
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

export async function getFileList(options: ScaffoldConfig, template: string): Promise<string[]> {
  return (
    await promisify(glob)(template, {
      dot: true,
      debug: options.verbose === LogLevel.Debug,
      nodir: true,
    })
  ).map((f) => f.replace(/\//g, path.sep))
}

export interface GlobInfo {
  nonGlobTemplate: string
  origTemplate: string
  isDirOrGlob: boolean
  isGlob: boolean
  template: string
}

export async function getTemplateGlobInfo(options: ScaffoldConfig, template: string): Promise<GlobInfo> {
  const isGlob = glob.hasMagic(template)
  log(options, LogLevel.Debug, "before isDir", "isGlob:", isGlob, template)
  let _template = template
  const nonGlobTemplate = isGlob ? removeGlob(template) : template
  const isDirOrGlob = isGlob ? true : await isDir(template)
  log(options, LogLevel.Debug, "after isDir", isDirOrGlob)
  const _shouldAddGlob = !isGlob && isDirOrGlob
  const origTemplate = template
  if (_shouldAddGlob) {
    _template = path.join(template, "**", "*")
  }
  return { nonGlobTemplate, origTemplate, isDirOrGlob, isGlob, template: _template }
}

export async function ensureFileExists(template: string, isGlob: boolean): Promise<void> {
  if (!isGlob && !(await pathExists(template))) {
    const err: NodeJS.ErrnoException = new Error(`ENOENT, no such file or directory ${template}`)
    err.code = "ENOENT"
    err.path = template
    err.errno = -2
    throw err
  }
}

export interface OutputFileInfo {
  inputPath: string
  outputPathOpt: string
  outputDir: string
  outputPath: string
  exists: boolean
}

export async function getTemplateFileInfo(
  options: ScaffoldConfig,
  data: Record<string, string>,
  { templatePath, basePath }: { templatePath: string; basePath: string }
): Promise<OutputFileInfo> {
  const inputPath = path.resolve(process.cwd(), templatePath)
  const outputPathOpt = getOptionValueForFile(options, inputPath, options.output)
  const outputDir = getOutputDir(options, outputPathOpt, basePath)
  const outputPath = handlebarsParse(options, path.join(outputDir, path.basename(inputPath)), {
    isPath: true,
  }).toString()
  const exists = await pathExists(outputPath)
  return { inputPath, outputPathOpt, outputDir, outputPath, exists }
}

export async function copyFileTransformed(
  options: ScaffoldConfig,
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
  }
): Promise<void> {
  if (!exists || overwrite) {
    if (exists && overwrite) {
      log(options, LogLevel.Info, `File ${outputPath} exists, overwriting`)
    }
    const templateBuffer = await readFile(inputPath)
    const unprocessedOutputContents = handlebarsParse(options, templateBuffer)
    const finalOutputContents = (
      (await options.beforeWrite?.(unprocessedOutputContents, templateBuffer, outputPath)) ?? unprocessedOutputContents
    ).toString()

    if (!options.dryRun) {
      await writeFile(outputPath, finalOutputContents)
      log(options, LogLevel.Info, "Done.")
    } else {
      log(options, LogLevel.Info, "Content output:")
      log(options, LogLevel.Info, finalOutputContents)
    }
  } else if (exists) {
    log(options, LogLevel.Info, `File ${outputPath} already exists, skipping`)
  }
}

export function getOutputDir(options: ScaffoldConfig, outputPathOpt: string, basePath: string): string {
  return path.resolve(
    process.cwd(),
    ...([
      outputPathOpt,
      basePath,
      options.createSubFolder
        ? options.subFolderNameHelper
          ? handlebarsParse(options, `{{ ${options.subFolderNameHelper} name }}`).toString()
          : options.name
        : undefined,
    ].filter(Boolean) as string[])
  )
}

export function logInputFile(
  options: ScaffoldConfig,
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
  }
): void {
  log(
    options,
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
    `\n`
  )
}

export function logInitStep(options: ScaffoldConfig): void {
  log(options, LogLevel.Debug, "Full config:", {
    name: options.name,
    templates: options.templates,
    output: options.output,
    createSubfolder: options.createSubFolder,
    data: options.data,
    overwrite: options.overwrite,
    quiet: options.quiet,
    subFolderTransformHelper: options.subFolderNameHelper,
    helpers: Object.keys(options.helpers ?? {}),
    verbose: `${options.verbose} (${Object.keys(LogLevel).find(
      (k) => (LogLevel[k as any] as unknown as number) === options.verbose!
    )})`,
  })
  log(options, LogLevel.Info, "Data:", options.data)
}
