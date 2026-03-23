/**
 * @module
 * Simple Scaffold
 *
 * See [readme](README.md)
 */
import path from "node:path"
import os from "node:os"
import { exec } from "node:child_process"

import { handleErr, resolve } from "./utils"
import { isDir, getTemplateGlobInfo, getFileList, handleTemplateFile, GlobInfo } from "./file"
import { removeGlob, makeRelativePath, getBasePath } from "./path-utils"
import { LogLevel, MinimalConfig, Resolver, ScaffoldCmdConfig, ScaffoldConfig } from "./types"
import { registerHelpers } from "./parser"
import { log, logInitStep, logFileTree, logSummary } from "./logger"
import { parseConfigFile } from "./config"
import { resolveInputs } from "./prompts"
import { loadIgnorePatterns, filterIgnoredFiles } from "./ignore"
import { assertConfigValid } from "./validate"

/**
 * Create a scaffold using given `options`.
 *
 * #### Create files
 * To create a file structure to output, use any directory and file structure you would like.
 * Inside folder names, file names or file contents, you may place `{{ var }}` where `var` is either
 * `name` which is the scaffold name you provided or one of the keys you provided in the `data` option.
 *
 * The contents and names will be replaced with the transformed values so you can use your original structure as a
 * boilerplate for other projects, components, modules, or even single files.
 *
 * The files will maintain their structure, starting from the directory containing the template (or the template itself
 * if it is already a directory), and will output from that directory into the directory defined by `config.output`.
 *
 * #### Helpers
 * Helpers are functions you can use to transform your `{{ var }}` contents into other values without having to
 * pre-define the data and use a duplicated key.
 *
 * Any functions you provide in `helpers` option will also be available to you to make custom formatting as you see fit
 * (for example, formatting a date)
 *
 * For available default values, see {@link DefaultHelpers}.
 *
 * @param {ScaffoldConfig} config The main configuration object
 * @return {Promise<void>} A promise that resolves when the scaffold is complete
 *
 * @see {@link DefaultHelpers}
 * @see {@link CaseHelpers}
 * @see {@link DateHelpers}
 *
 * @category Main
 */
export async function Scaffold(config: ScaffoldConfig): Promise<void> {
  config.output ??= process.cwd()

  await assertConfigValid(config)
  config = await resolveInputs(config)
  registerHelpers(config)

  const startTime = performance.now()
  const writtenFiles: string[] = []
  try {
    config.data = { name: config.name, ...config.data }
    logInitStep(config)

    log(config, LogLevel.info, `Scaffolding "${config.name}"...`)

    const excludes = config.templates.filter((t) => t.startsWith("!"))
    const includes = config.templates.filter((t) => !t.startsWith("!"))

    const templates = await resolveTemplateGlobs(config, includes)

    for (const tpl of templates) {
      const files = await processTemplateGlob(config, tpl, excludes)
      writtenFiles.push(...files)
    }
  } catch (e: unknown) {
    log(config, LogLevel.error, e)
    throw e
  }

  const elapsed = performance.now() - startTime

  logFileTree(config, writtenFiles)
  logSummary(config, writtenFiles.length, elapsed, config.dryRun)

  if (config.afterScaffold) {
    await runAfterScaffoldHook(config, writtenFiles)
  }
}

/** Resolves included template paths into GlobInfo objects. */
async function resolveTemplateGlobs(
  config: ScaffoldConfig,
  includes: string[],
): Promise<GlobInfo[]> {
  const templates: GlobInfo[] = []
  for (const includedTemplate of includes) {
    try {
      templates.push(await getTemplateGlobInfo(config, includedTemplate))
    } catch (e: unknown) {
      handleErr(e as NodeJS.ErrnoException)
    }
  }
  return templates
}

/** Processes all files matching a single template glob pattern. Returns paths of written files. */
async function processTemplateGlob(
  config: ScaffoldConfig,
  tpl: GlobInfo,
  excludes: string[],
): Promise<string[]> {
  const written: string[] = []

  // Load .scaffoldignore from the template base directory
  const ignorePatterns = await loadIgnorePatterns(tpl.baseTemplatePath)
  if (ignorePatterns.length > 0) {
    log(config, LogLevel.debug, `Loaded .scaffoldignore patterns:`, ignorePatterns)
  }

  const allFiles = await getFileList(config, [tpl.template, ...excludes])
  const files = filterIgnoredFiles(allFiles, ignorePatterns, tpl.baseTemplatePath)
  for (const file of files) {
    if (await isDir(file)) {
      continue
    }
    log(config, LogLevel.debug, "Iterating files", { files, file })
    const relPath = makeRelativePath(
      path.dirname(removeGlob(file).replace(tpl.baseTemplatePath, "")),
    )
    const basePath = getBasePath(relPath)

    log(config, LogLevel.debug, {
      originalTemplate: tpl.origTemplate,
      relativePath: relPath,
      parsedTemplate: tpl.template,
      inputFilePath: file,
      baseTemplatePath: tpl.baseTemplatePath,
      basePath,
      isDirOrGlob: tpl.isDirOrGlob,
      isGlob: tpl.isGlob,
    })

    const outputPath = await handleTemplateFile(config, { templatePath: file, basePath })
    if (outputPath) {
      written.push(outputPath)
    }
  }
  return written
}

/** Executes the afterScaffold hook — either a function or a shell command string. */
async function runAfterScaffoldHook(config: ScaffoldConfig, files: string[]): Promise<void> {
  const hook = config.afterScaffold!

  if (typeof hook === "function") {
    log(config, LogLevel.debug, "Running afterScaffold function hook")
    await hook({ config, files })
    return
  }

  // Shell command string
  const outputDir = typeof config.output === "string" ? config.output : process.cwd()
  const cwd = path.resolve(process.cwd(), outputDir)

  log(config, LogLevel.info, `Running afterScaffold command: ${hook}`)
  await new Promise<void>((resolve, reject) => {
    const proc = exec(hook, { cwd })
    proc.stdout?.on("data", (data: string) => {
      log(config, LogLevel.info, data.toString().trimEnd())
    })
    proc.stderr?.on("data", (data: string) => {
      log(config, LogLevel.warning, data.toString().trimEnd())
    })
    proc.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`afterScaffold command exited with code ${code}`))
      }
    })
    proc.on("error", reject)
  })
}

/**
 * Create a scaffold based on a config file or URL.
 *
 * @param {string} pathOrUrl The path or URL to the config file
 * @param {Record<string, string>} config Information needed before loading the config
 * @param {Partial<Omit<ScaffoldConfig, 'name'>>} overrides Any overrides to the loaded config
 *
 * @see {@link Scaffold}
 * @category Main
 * @return {Promise<void>} A promise that resolves when the scaffold is complete
 */
Scaffold.fromConfig = async function (
  pathOrUrl: string,
  config: MinimalConfig,
  overrides?: Resolver<ScaffoldCmdConfig, Partial<Omit<ScaffoldConfig, "name">>>,
): Promise<void> {
  const tmpPath = path.resolve(os.tmpdir(), `scaffold-config-${Date.now()}`)
  const _cmdConfig: ScaffoldCmdConfig = {
    dryRun: false,
    output: process.cwd(),
    logLevel: LogLevel.info,
    overwrite: false,
    templates: [],
    subdir: false,
    quiet: false,
    config: pathOrUrl,
    version: false,
    tmpDir: tmpPath,
    ...config,
  }
  const _overrides = resolve(overrides, _cmdConfig)
  const _config = await parseConfigFile(_cmdConfig)
  return Scaffold({ ..._config, ..._overrides })
}

export default Scaffold
