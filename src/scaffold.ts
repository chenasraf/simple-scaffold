import { access, stat, mkdir, open, readFile, writeFile } from "fs/promises"
import { glob } from "glob"
import Handlebars = require("handlebars")
import camelCase from "lodash/camelCase"
import snakeCase from "lodash/snakeCase"
import kebabCase from "lodash/kebabCase"
import startCase from "lodash/startCase"
import path = require("path")
import { F_OK } from "constants"
import { promisify } from "util"

type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export interface ScaffoldConfig {
  name: string
  templates: string[]
  outputPath: FileResponse<string>
  createSubfolder?: boolean
  data?: Record<string, string>
  overwrite?: FileResponse<boolean>
  silent?: boolean
}

const helpers = {
  camelCase,
  snakeCase,
  startCase,
  kebabCase,
  hyphenCase: kebabCase,
  pascalCase,
}

for (const helperName in helpers) {
  Handlebars.registerHelper(helperName, helpers[helperName as keyof typeof helpers])
}

export async function Scaffold(config: ScaffoldConfig) {
  try {
    const options = { ...config }
    const data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    l(options, "Config:", options)
    l(options, "Data:", data)
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
    process.exit(e.code ?? 1)
  }
}

async function handleTemplateFile(
  templatePath: string,
  options: ScaffoldConfig,
  data: Record<string, string>
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      l(options, `Parsing ${templatePath}`)
      const inputPath = path.join(process.cwd(), templatePath)
      const outputPathOpt = getOptionValueForFile(inputPath, options.outputPath)
      const outputDir = path.join(
        process.cwd(),
        ...([outputPathOpt, options.createSubfolder ? options.name : undefined].filter(Boolean) as string[])
      )
      const outputPath = path.join(outputDir, handlebarsParse(path.basename(inputPath), data))
      const overwrite = getOptionValueForFile(inputPath, options.overwrite ?? false)
      const exists = await pathExists(outputPath)

      await createDirIfNotExists(outputDir, options)

      l(options, `Writing to ${outputPath}`)
      if (!exists || overwrite) {
        if (exists && overwrite) {
          l(options, `File ${outputPath} exists, overwriting`)
        }
        const templateBuffer = await readFile(inputPath)
        const outputContents = handlebarsParse(templateBuffer, data)

        await writeFile(outputPath, outputContents)
        resolve()
      } else if (exists) {
        l(options, `File ${outputPath} already exists, skipping`)
      }
    } catch (e) {
      handleErr(e)
      reject(e)
    }
  })
}

function handlebarsParse(templateBuffer: Buffer | string, data: Record<string, string>) {
  const parser = Handlebars.compile(templateBuffer.toString(), { noEscape: true })
  const outputContents = parser(data)
  return outputContents
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, F_OK)
    return true
  } catch (e) {
    if (e.code === "ENOENT") {
      return false
    }
    throw e
  }
}

function handleErr(err: NodeJS.ErrnoException | null) {
  if (err) throw err
}

function l(options: ScaffoldConfig, ...obj: any[]) {
  if (options.silent) {
    return
  }
  console.log(...obj)
}

async function createDirIfNotExists(dir: string, options: ScaffoldConfig): Promise<void> {
  const parentDir = path.dirname(dir)

  if (!(await pathExists(parentDir))) {
    await createDirIfNotExists(parentDir, options)
  }

  if (!(await pathExists(dir))) {
    try {
      await mkdir(dir)
      return
    } catch (e) {
      if (e.code !== "EEXIST") {
        throw e
      }
      return
    }
  }
}

function pascalCase(s: string): string {
  return startCase(s).replace(/\s+/g, "")
}

function getOptionValueForFile<T>(filePath: string, fn: FileResponse<T>, defaultValue?: T): T {
  if (typeof fn !== "function") {
    return defaultValue ?? (fn as T)
  }
  return (fn as FileResponseFn<T>)(filePath, path.dirname(filePath), path.basename(filePath))
}

export default Scaffold
