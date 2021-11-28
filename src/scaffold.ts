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
} from "./utils"
import { LogLevel, ScaffoldConfig } from "./types"

export async function Scaffold(config: ScaffoldConfig) {
  try {
    const options = { ...config }
    const data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    log(options, LogLevel.Debug, "Full config:", {
      name: options.name,
      templates: options.templates,
      output: options.output,
      createSubfolder: options.createSubFolder,
      data: options.data,
      overwrite: options.overwrite,
      quiet: options.quiet,
    })
    log(options, LogLevel.Info, "Data:", data)
    for (let template of config.templates) {
      try {
        const _isGlob = template.includes("*")
        const _nonGlobTemplate = _isGlob ? removeGlob(template) : template
        const _isDir = _isGlob ? false : await isDir(template)
        const _shouldAddGlob = !_isGlob && !_isDir
        if (_shouldAddGlob) {
          template = template + "/**/*"
        }
        const files = await promisify(glob)(template, { dot: true, debug: false })
        for (const templatePath of files) {
          if (!(await isDir(templatePath))) {
            const basePath = path
              .resolve(
                process.cwd(),
                _isDir
                  ? templatePath.replace(template, "")
                  : path.dirname(removeGlob(templatePath).replace(_nonGlobTemplate, ""))
              )
              .replace(process.cwd() + "/", "")
              .replace(process.cwd(), "")
            log(
              options,
              LogLevel.Debug,
              `\ntemplate: ${template}\ntemplatePath: ${templatePath}, \nbase path: ${basePath}\n`
            )
            await handleTemplateFile(templatePath, basePath, options, data)
          }
        }
      } catch (e: any) {
        handleErr(e)
      }
    }
  } catch (e: any) {
    console.error(e)
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
      log(
        options,
        LogLevel.Debug,
        `\nParsing ${templatePath}`,
        `\nBase path: ${basePath}`,
        `\nFull input path: ${inputPath}`,
        `\nFull output path: ${outputDir}\n`
      )
      const outputPath = path.join(outputDir, handlebarsParse(path.basename(inputPath), data))
      const overwrite = getOptionValueForFile(inputPath, data, options.overwrite ?? false)
      const exists = await pathExists(outputPath)

      log(
        options,
        LogLevel.Debug,
        "Filename parsed:",
        handlebarsParse(path.basename(inputPath), data),
        "Orig:",
        path.basename(inputPath)
        // "Test:",
        // handlebarsParse("{{name}} {{name pascalCase}}", data)
      )

      await createDirIfNotExists(outputDir, options)

      log(options, LogLevel.Info, `Writing to ${outputPath}`)
      if (!exists || overwrite) {
        if (exists && overwrite) {
          log(options, LogLevel.Info, `File ${outputPath} exists, overwriting`)
        }
        const templateBuffer = await readFile(inputPath)
        const outputContents = handlebarsParse(templateBuffer, data)

        if (!options.dryRun) {
          await writeFile(outputPath, outputContents)
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
