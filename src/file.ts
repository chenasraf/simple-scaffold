import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import { F_OK } from "node:constants"
import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import { glob, hasMagic } from "glob"
import { log } from "./logger"
import { getOptionValueForFile } from "./config"
import { handlebarsParse } from "./parser"
import { handleErr } from "./utils"

const { stat, access, mkdir, readFile, writeFile } = fs

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
    } catch (e: any) {
      if (e.code !== "EEXIST") {
        throw e
      }
      return
    }
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

export async function isDir(path: string): Promise<boolean> {
  const tplStat = await stat(path)
  return tplStat.isDirectory()
}

export function removeGlob(template: string): string {
  return path.normalize(template.replace(/\*/g, ""))
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

export async function getFileList(config: ScaffoldConfig, templates: string[]): Promise<string[]> {
  log(config, LogLevel.debug, `Getting file list for glob list: ${templates}`)
  return (
    await glob(templates, {
      dot: true,
      nodir: true,
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
  log(config, LogLevel.debug, "before isDir", "isGlob:", isGlob, template)
  let _template = template
  let nonGlobTemplate = isGlob ? removeGlob(template) : template
  nonGlobTemplate = path.normalize(nonGlobTemplate)
  const isDirOrGlob = isGlob ? true : await isDir(template)
  const _shouldAddGlob = !isGlob && isDirOrGlob
  log(config, LogLevel.debug, "after", { isDirOrGlob, _shouldAddGlob })
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
  const outputDir = getOutputDir(config, outputPathOpt, basePath.replace(config.tmpDir!, "./"))
  const rawOutputPath = path.join(outputDir, path.basename(inputPath))
  const outputPath = handlebarsParse(config, rawOutputPath, { asPath: true }).toString()
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
      log(config, LogLevel.info, `File ${outputPath} exists, overwriting`)
    }
    log(config, LogLevel.debug, `Processing file ${inputPath}`)
    const templateBuffer = await readFile(inputPath)
    const unprocessedOutputContents = handlebarsParse(config, templateBuffer)
    const finalOutputContents =
      (await config.beforeWrite?.(unprocessedOutputContents, templateBuffer, outputPath)) ?? unprocessedOutputContents

    if (!config.dryRun) {
      await writeFile(outputPath, finalOutputContents)
    } else {
      log(config, LogLevel.info, "Dry Run. Output should be:")
      log(config, LogLevel.info, finalOutputContents.toString())
    }
  } else if (exists) {
    log(config, LogLevel.info, `File ${outputPath} already exists, skipping`)
  }
  log(config, LogLevel.info, "Done.")
}

export function getOutputDir(config: ScaffoldConfig, outputPathOpt: string, basePath: string): string {
  return path.resolve(
    process.cwd(),
    ...([
      outputPathOpt,
      basePath,
      config.subdir
        ? config.subdirHelper
          ? handlebarsParse(config, `{{ ${config.subdirHelper} name }}`).toString()
          : config.name
        : undefined,
    ].filter(Boolean) as string[]),
  )
}

export async function handleTemplateFile(
  config: ScaffoldConfig,
  { templatePath, basePath }: { templatePath: string; basePath: string },
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const { inputPath, outputPathOpt, outputDir, outputPath, exists } = await getTemplateFileInfo(config, {
        templatePath,
        basePath,
      })
      const overwrite = getOptionValueForFile(config, inputPath, config.overwrite ?? false)

      log(
        config,
        LogLevel.debug,
        `\nParsing ${templatePath}`,
        `\nBase path: ${basePath}`,
        `\nFull input path: ${inputPath}`,
        `\nOutput Path Opt: ${outputPathOpt}`,
        `\nFull output dir: ${outputDir}`,
        `\nFull output path: ${outputPath}`,
        `\n`,
      )

      await createDirIfNotExists(path.dirname(outputPath), config)

      log(config, LogLevel.info, `Writing to ${outputPath}`)
      await copyFileTransformed(config, { exists, overwrite, outputPath, inputPath })
      resolve()
    } catch (e: any) {
      handleErr(e)
      reject(e)
    }
  })
}

/** @internal */
export function getUniqueTmpPath(): string {
  return path.resolve(os.tmpdir(), `scaffold-config-${Date.now()}-${Math.random().toString(36).slice(2)}`)
}
