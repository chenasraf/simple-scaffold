import path from "node:path"
import fs from "node:fs/promises"
import { FileResponse, FileResponseHandler, LogLevel, ScaffoldConfig } from "./types"
import { glob, hasMagic } from "glob"
import { log } from "./logger"
import { handlebarsParse } from "./parser"
import { handleErr } from "./utils"
import { createDirIfNotExists, pathExists, isDir } from "./fs-utils"
import { removeGlob } from "./path-utils"

const { readFile, writeFile } = fs

// Re-export extracted utilities for backward compatibility (tests import from here)
export { createDirIfNotExists, pathExists, isDir, getUniqueTmpPath } from "./fs-utils"
export { removeGlob, makeRelativePath, getBasePath } from "./path-utils"

/**
 * Resolves a config option that may be either a static value or a per-file function.
 * For function values, the file path is parsed through Handlebars before being passed.
 * @internal
 */
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
    path.dirname(handlebarsParse(config, filePath, { asPath: true }).toString()),
    path.basename(handlebarsParse(config, filePath, { asPath: true }).toString()),
  )
}

/** Information about a template glob pattern and how it was resolved. */
export interface GlobInfo {
  /** The template path with glob wildcards stripped. */
  baseTemplatePath: string
  /** The original template string as provided by the user. */
  origTemplate: string
  /** Whether the template is a directory or contains glob patterns. */
  isDirOrGlob: boolean
  /** Whether the template contains glob wildcard characters. */
  isGlob: boolean
  /** The final resolved template path (with `**\/*` appended for directories). */
  template: string
}

/** Expands a list of glob patterns into a flat list of matching file paths. */
export async function getFileList(config: ScaffoldConfig, templates: string[]): Promise<string[]> {
  log(config, LogLevel.debug, `Getting file list for glob list: ${templates}`)
  return (
    await glob(templates, {
      dot: true,
      nodir: true,
    })
  ).map(path.normalize)
}

/** Analyzes a template path to determine if it's a glob, directory, or single file. */
export async function getTemplateGlobInfo(
  config: ScaffoldConfig,
  template: string,
): Promise<GlobInfo> {
  const _isGlob = hasMagic(template)
  log(config, LogLevel.debug, "before isDir", "isGlob:", _isGlob, template)

  let resolvedTemplate = template
  let baseTemplatePath = _isGlob ? removeGlob(template) : template
  baseTemplatePath = path.normalize(baseTemplatePath)
  const isDirOrGlob = _isGlob ? true : await isDir(template)
  const shouldAddGlob = !_isGlob && isDirOrGlob
  log(config, LogLevel.debug, "after", { isDirOrGlob, shouldAddGlob })

  if (shouldAddGlob) {
    resolvedTemplate = path.join(template, "**", "*")
  }
  return {
    baseTemplatePath,
    origTemplate: template,
    isDirOrGlob,
    isGlob: _isGlob,
    template: resolvedTemplate,
  }
}

/** Complete information about a template file's output destination. */
export interface OutputFileInfo {
  inputPath: string
  outputPathOpt: string
  outputDir: string
  outputPath: string
  exists: boolean
}

/** Computes the full output path and metadata for a single template file. */
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

/**
 * Reads a template file, applies Handlebars parsing, runs the beforeWrite hook,
 * and writes the result to the output path.
 */
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
      log(config, LogLevel.debug, `Overwriting ${outputPath}`)
    }
    log(config, LogLevel.debug, `Processing file ${inputPath}`)
    const templateBuffer = await readFile(inputPath)
    const unprocessedOutputContents = handlebarsParse(config, templateBuffer)
    const finalOutputContents =
      (await config.beforeWrite?.(unprocessedOutputContents, templateBuffer, outputPath)) ??
      unprocessedOutputContents

    if (!config.dryRun) {
      await writeFile(outputPath, finalOutputContents)
    } else {
      log(config, LogLevel.debug, "Dry run — output would be:")
      log(config, LogLevel.debug, finalOutputContents.toString())
    }
  } else if (exists) {
    log(config, LogLevel.debug, `Skipped ${outputPath} (already exists)`)
  }
}

/** Computes the output directory for a file, combining the output path, base path, and optional subdir. */
export function getOutputDir(
  config: ScaffoldConfig,
  outputPathOpt: string,
  basePath: string,
): string {
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

/**
 * Processes a single template file: resolves output paths, creates directories,
 * and writes the transformed output.
 * Returns the output path if the file was written, or null if skipped.
 */
export async function handleTemplateFile(
  config: ScaffoldConfig,
  { templatePath, basePath }: { templatePath: string; basePath: string },
): Promise<string | null> {
  try {
    const { inputPath, outputPathOpt, outputDir, outputPath, exists } = await getTemplateFileInfo(
      config,
      {
        templatePath,
        basePath,
      },
    )
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

    const shouldWrite = (!exists || overwrite) && !config.dryRun
    log(config, LogLevel.debug, `Writing to ${outputPath}`)
    await copyFileTransformed(config, { exists, overwrite, outputPath, inputPath })
    return shouldWrite ? outputPath : null
  } catch (e: unknown) {
    handleErr(e as NodeJS.ErrnoException)
    throw e
  }
}
