/**
 * @module
 * Simple Scaffold
 *
 * See [readme](README.md)
 */
import path from "path"

import {
  createDirIfNotExists,
  getOptionValueForFile,
  handleErr,
  log,
  pascalCase,
  isDir,
  removeGlob,
  makeRelativePath,
  registerHelpers,
  getTemplateGlobInfo,
  getFileList,
  getBasePath,
  copyFileTransformed,
  getTemplateFileInfo,
  logInitStep,
  logInputFile,
} from "./utils"
import { LogLevel, ScaffoldConfig } from "./types"

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
 *
 * @see {@link DefaultHelpers}
 * @see {@link CaseHelpers}
 * @see {@link DateHelpers}
 *
 * @category Main
 */
export async function Scaffold(config: ScaffoldConfig): Promise<void> {
  config.output ??= process.cwd()

  registerHelpers(config)
  try {
    config.data = { name: config.name, Name: pascalCase(config.name), ...config.data }
    logInitStep(config)
    for (let _template of config.templates) {
      try {
        const { nonGlobTemplate, origTemplate, isDirOrGlob, isGlob, template } = await getTemplateGlobInfo(
          config,
          _template,
        )
        const files = await getFileList(config, template)
        for (const inputFilePath of files) {
          if (await isDir(inputFilePath)) {
            continue
          }
          const relPath = makeRelativePath(path.dirname(removeGlob(inputFilePath).replace(nonGlobTemplate, "")))
          const basePath = getBasePath(relPath)
          logInputFile(config, {
            origTemplate,
            relPath,
            template,
            inputFilePath,
            nonGlobTemplate,
            basePath,
            isDirOrGlob,
            isGlob,
          })
          await handleTemplateFile(config, {
            templatePath: inputFilePath,
            basePath,
          })
        }
      } catch (e: any) {
        handleErr(e)
      }
    }
  } catch (e: any) {
    log(config, LogLevel.Error, e)
    throw e
  }
}
async function handleTemplateFile(
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

export default Scaffold
