import path from "path"
import { F_OK } from "constants"
import { LogLevel, ScaffoldConfig } from "./types"
import { promises as fsPromises } from "fs"
const { stat, access, mkdir } = fsPromises
import { glob, hasMagic } from "glob"
import { log } from "./logger"
import { getOptionValueForFile } from "./config"
import { handlebarsParse } from "./parser"
import { handleErr } from "./utils"

const { readFile, writeFile } = fsPromises

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
      log(config, LogLevel.Info, "Dry Run. Output should be:")
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
        LogLevel.Debug,
        `\nParsing ${templatePath}`,
        `\nBase path: ${basePath}`,
        `\nFull input path: ${inputPath}`,
        `\nOutput Path Opt: ${outputPathOpt}`,
        `\nFull output dir: ${outputDir}`,
        `\nFull output path: ${outputPath}`,
        `\n`,
      )

      await createDirIfNotExists(path.dirname(outputPath), config)

      log(config, LogLevel.Info, `Writing to ${outputPath}`)
      await copyFileTransformed(config, { exists, overwrite, outputPath, inputPath })
      resolve()
    } catch (e: any) {
      handleErr(e)
      reject(e)
    }
  })
}
