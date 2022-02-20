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
  registerHelpers,
  getTemplateGlobInfo,
  ensureFileExists,
  getFileList,
  getBasePath,
  copyFileTransformed,
  getTemplateFileInfo,
  logInitStep,
  logInputFile,
  GlobInfo,
  OutputFileInfo,
} from "./utils"
import { FileResponse, LogLevel, ScaffoldConfig } from "./types"

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
 * #### Helpers
 * Helpers are functions you can use to transform your `{{ var }}` contents into other values without having to
 * pre-define the data and use a duplicated key. Common cases are transforming name-case format
 * (e.g. `MyName` &rarr; `my_name`), so these have been provided as defaults:
 *
 * | Helper name | Example code            | Example output |
 * | ----------- | ----------------------- | -------------- |
 * | camelCase   | `{{ camelCase name }}`  | myName         |
 * | snakeCase   | `{{ snakeCase name }}`  | my_name        |
 * | startCase   | `{{ startCase name }}`  | My Name        |
 * | kebabCase   | `{{ kebabCase name }}`  | my-name        |
 * | hyphenCase  | `{{ hyphenCase name }}` | my-name        |
 * | pascalCase  | `{{ pascalCase name }}` | MyName         |
 * | upperCase   | `{{ upperCase name }}`  | MYNAME         |
 * | lowerCase   | `{{ lowerCase name }}`  | myname         |
 *
 * Any functions you provide in `helpers` option will also be available to you to make custom formatting as you see fit
 * (for example, formatting a date)
 */
export async function Scaffold({ ...options }: ScaffoldConfig) {
  options.output ??= process.cwd()

  registerHelpers(options)
  try {
    options.data = { name: options.name, Name: pascalCase(options.name), ...options.data }
    logInitStep(options)
    for (let _template of options.templates) {
      try {
        const { nonGlobTemplate, origTemplate, isDirOrGlob, isGlob, template } = await getTemplateGlobInfo(
          options,
          _template
        )
        await ensureFileExists(template, isDirOrGlob)
        const files = await getFileList(options, template)
        for (const inputFilePath of files) {
          if (await isDir(inputFilePath)) {
            continue
          }
          const relPath = makeRelativePath(path.dirname(removeGlob(inputFilePath).replace(nonGlobTemplate, "")))
          const basePath = getBasePath(relPath)
          logInputFile(options, {
            origTemplate,
            relPath,
            template,
            inputFilePath,
            nonGlobTemplate,
            basePath,
            isDirOrGlob,
            isGlob,
          })
          await handleTemplateFile(options, options.data, { templatePath: inputFilePath, basePath })
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
  options: ScaffoldConfig,
  data: Record<string, string>,
  { templatePath, basePath }: { templatePath: string; basePath: string }
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const { inputPath, outputPathOpt, outputDir, outputPath, exists } = await getTemplateFileInfo(options, data, {
        templatePath,
        basePath,
      })
      const overwrite = getOptionValueForFile(options, inputPath, data, options.overwrite ?? false)

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

      await createDirIfNotExists(path.dirname(outputPath), options)

      log(options, LogLevel.Info, `Writing to ${outputPath}`)
      await copyFileTransformed(options, data, { exists, overwrite, outputPath, inputPath })
      resolve()
    } catch (e: any) {
      handleErr(e)
      reject(e)
    }
  })
}

export default Scaffold
