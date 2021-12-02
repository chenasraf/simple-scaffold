import { glob } from "glob"
import path from "path"
import { promisify } from "util"
import { promises as fsPromises } from "fs"
const { readFile, writeFile } = fsPromises

import {
  createDirIfNotExists,
  getOptionValueForFile,
  handleErr,
  handlebarsParse,
  log,
  pathExists,
  pascalCase,
  isDir,
  removeGlob,
  makeRelativePath,
} from "./utils"
import { LogLevel, ScaffoldConfig } from "./types"

export async function Scaffold(config: ScaffoldConfig) {
  const options = { ...config }
  try {
    const data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    log(options, LogLevel.Debug, "Full config:", {
      name: options.name,
      templates: options.templates,
      output: options.output,
      createSubfolder: options.createSubFolder,
      data: options.data,
      overwrite: options.overwrite,
      quiet: options.quiet,
      verbose: `${options.verbose} (${Object.keys(LogLevel).find(
        (k) => (LogLevel[k as any] as unknown as number) === options.verbose!
      )})`,
    })
    log(options, LogLevel.Info, "Data:", data)
    for (let template of config.templates) {
      try {
        const _isGlob = template.includes("*")
        if (!_isGlob && !(await pathExists(template))) {
          const err: NodeJS.ErrnoException = new Error(`ENOENT, no such file or directory ${template}`)
          err.code = "ENOENT"
          err.path = "non-existing-input"
          err.errno = -2
          throw err
        }
        const _nonGlobTemplate = _isGlob ? removeGlob(template) : template
        log(options, LogLevel.Debug, "before isDir", "isGlob:", _isGlob, template)
        const _isDir = _isGlob ? true : await isDir(template)
        log(options, LogLevel.Debug, "after isDir", _isDir)
        const _shouldAddGlob = !_isGlob && _isDir
        const origTemplate = template
        if (_shouldAddGlob) {
          template = template + "/**/*"
        }
        log(options, LogLevel.Debug, "before glob")
        const files = await promisify(glob)(template, {
          dot: true,
          debug: false,
          nodir: options.verbose === LogLevel.Debug,
          nobrace: true,
          noext: true,
          nocomment: true,
          nonegate: true,
        })
        log(options, LogLevel.Debug, "after glob")
        for (const inputFilePath of files) {
          if (!(await isDir(inputFilePath))) {
            const relPath = makeRelativePath(path.dirname(removeGlob(inputFilePath).replace(_nonGlobTemplate, "")))
            const basePath = path
              .resolve(process.cwd(), relPath)
              .replace(process.cwd() + "/", "")
              .replace(process.cwd(), "")
            log(
              options,
              LogLevel.Debug,
              `\nprocess.cwd(): ${process.cwd()}`,
              `\norigTemplate: ${origTemplate}`,
              `\nrelPath: ${relPath}`,
              `\ntemplate: ${template}`,
              `\ninputFilePath: ${inputFilePath}`,
              `\nnonGlobTemplate: ${_nonGlobTemplate}`,
              `\nbasePath: ${basePath}`,
              `\nisDir: ${_isDir}`,
              `\nisGlob: ${_isGlob}`,
              `\n`
            )
            await handleTemplateFile(inputFilePath, basePath, options, data)
          }
        }
      } catch (e: any) {
        handleErr(e)
      }
    }
  } catch (e: any) {
    log(options, LogLevel.Error, e)
    throw e
  }
}

async function handleTemplateFile(
  templatePath: string,
  basePath: string,
  options: ScaffoldConfig,
  data: Record<string, string>
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const inputPath = path.resolve(process.cwd(), templatePath)
      const outputPathOpt = getOptionValueForFile(inputPath, data, options.output)
      const outputDir = path.resolve(
        process.cwd(),
        ...([outputPathOpt, basePath, options.createSubFolder ? options.name : undefined].filter(Boolean) as string[])
      )
      const outputPath = handlebarsParse(path.join(outputDir, path.basename(inputPath)), data)
      log(
        options,
        LogLevel.Debug,
        `\nParsing ${templatePath}`,
        `\nBase path: ${basePath}`,
        `\nFull input path: ${inputPath}`,
        `\nOutput Path Opt: ${outputPathOpt}`,
        `\nFull output dir: ${outputDir}`,
        `\nFull output path: ${outputPath}`,
        `\n`
      )
      const overwrite = getOptionValueForFile(inputPath, data, options.overwrite ?? false)
      const exists = await pathExists(outputPath)

      await createDirIfNotExists(path.dirname(outputPath), options)

      log(options, LogLevel.Info, `Writing to ${outputPath}`)
      if (!exists || overwrite) {
        if (exists && overwrite) {
          log(options, LogLevel.Info, `File ${outputPath} exists, overwriting`)
        }
        const templateBuffer = await readFile(inputPath)
        const outputContents = handlebarsParse(templateBuffer, data)

        if (!options.dryRun) {
          await writeFile(outputPath, outputContents)
          log(options, LogLevel.Info, "Done.")
        } else {
          log(options, LogLevel.Info, "Content output:")
          log(options, LogLevel.Info, outputContents)
        }
      } else if (exists) {
        log(options, LogLevel.Info, `File ${outputPath} already exists, skipping`)
      }
      resolve()
    } catch (e: any) {
      handleErr(e)
      reject(e)
    }
  })
}

export default Scaffold
