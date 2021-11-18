import { stat, readFile, writeFile } from "fs/promises"
import { glob } from "glob"
import path from "path"
import { promisify } from "util"

import {
  createDirIfNotExists,
  getOptionValueForFile,
  handleErr,
  handlebarsParse,
  log,
  pathExists,
  pascalCase,
} from "./utils"
import { ScaffoldConfig } from "./types"

export async function Scaffold(config: ScaffoldConfig) {
  try {
    const options = { ...config }
    const data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    log(options, "Config:", options)
    log(options, "Data:", data)
    for (let template of config.templates) {
      try {
        const tplStat = await stat(template)
        if (tplStat.isDirectory()) {
          template = template + "/**/*"
        }
        const files = await promisify(glob)(template, { dot: true })
        for (const templatePath of files) {
          await handleTemplateFile(templatePath, options, data)
        }
      } catch (e) {
        handleErr(e)
      }
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

async function handleTemplateFile(
  templatePath: string,
  options: ScaffoldConfig,
  data: Record<string, string>
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      log(options, `Parsing ${templatePath}`)
      const inputPath = path.join(process.cwd(), templatePath)
      const outputPathOpt = getOptionValueForFile(inputPath, data, options.outputPath)
      const outputDir = path.resolve(
        process.cwd(),
        ...([outputPathOpt, options.createSubfolder ? options.name : undefined].filter(Boolean) as string[])
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

        await writeFile(outputPath, outputContents)
      } else if (exists) {
        log(options, `File ${outputPath} already exists, skipping`)
      }
      resolve()
    } catch (e) {
      handleErr(e)
      reject(e)
    }
  })
}

export default Scaffold
