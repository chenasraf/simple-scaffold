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
} from "./utils"
import { ScaffoldConfig } from "./types"

export async function Scaffold(config: ScaffoldConfig) {
  try {
    const options = { ...config }
    const data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    log(options, "Config:", {
      name: options.name,
      templates: options.templates,
      output: options.output,
      createSubfolder: options.createSubFolder,
      data: options.data,
      overwrite: options.overwrite,
      quiet: options.quiet,
    })
    log(options, "Data:", data)
    for (let template of config.templates) {
      try {
        const _isDir = await isDir(template)
        const basePath = path
          .resolve(process.cwd(), _isDir ? template : path.dirname(template.replace("*", "").replace("//", "/")))
          .replace(process.cwd(), ".")
        if (_isDir) {
          template = template + "/**/*"
        }
        const files = await promisify(glob)(template, { dot: true, debug: false })
        for (const templatePath of files) {
          if (!(await isDir(templatePath))) {
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
      log(options, `Parsing ${templatePath}`)
      const inputPath = path.join(process.cwd(), templatePath)
      const outputPathOpt = getOptionValueForFile(inputPath, data, options.output)
      const outputDir = path.resolve(
        process.cwd(),
        ...([outputPathOpt, options.createSubFolder ? options.name : undefined].filter(Boolean) as string[])
      )
      const outputPath = path.join(outputDir, handlebarsParse(path.basename(inputPath), data))
      const overwrite = getOptionValueForFile(inputPath, data, options.overwrite ?? false)
      const exists = await pathExists(outputPath)

      await createDirIfNotExists(outputDir, options)

      log(options, `Writing to ${outputPath}`)
      if (!exists || overwrite) {
        if (exists && overwrite) {
          log(options, `File ${outputPath} exists, overwriting`)
        }
        const templateBuffer = await readFile(inputPath)
        const outputContents = handlebarsParse(templateBuffer, data)

        if (!options.dryRun) {
          await writeFile(outputPath, outputContents)
        } else {
          log(options, "Content output:")
          log(options, outputContents)
        }
      } else if (exists) {
        log(options, `File ${outputPath} already exists, skipping`)
      }
      resolve()
    } catch (e: any) {
      handleErr(e)
      reject(e)
    }
  })
}

export default Scaffold
