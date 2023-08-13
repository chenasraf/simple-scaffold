/**
 * @module
 * Simple Scaffold
 *
 * See [readme](README.md)
 */
import path from "node:path"
import { handleErr, resolve } from "./utils"
import {
  isDir,
  removeGlob,
  makeRelativePath,
  getTemplateGlobInfo,
  getFileList,
  getBasePath,
  handleTemplateFile,
} from "./file"
import { LogLevel, MinimalConfig, Resolver, ScaffoldCmdConfig, ScaffoldConfig } from "./types"
import { OptionsBase } from "massarg/types"
import { defaultHelpers, registerHelpers } from "./parser"
import { log, logInitStep, logInputFile } from "./logger"
import { parseConfig } from "./config"

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

  registerHelpers(config)
  try {
    config.data = { name: config.name, Name: defaultHelpers.pascalCase(config.name), ...config.data }
    logInitStep(config)
    for (let _template of config.templates) {
      try {
        const { nonGlobTemplate, origTemplate, isDirOrGlob, isGlob, template } = await getTemplateGlobInfo(
          config,
          _template,
        )
        const files = await getFileList(config, template)
        log(config, LogLevel.Debug, "Iterating files", { files, template })
        for (const inputFilePath of files) {
          if (await isDir(inputFilePath)) {
            continue
          }
          const relPath = makeRelativePath(path.dirname(removeGlob(inputFilePath).replace(nonGlobTemplate, "")))
          const basePath = getBasePath(relPath)
          logInputFile(config, {
            originalTemplate: origTemplate,
            relativePath: relPath,
            parsedTemplate: template,
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
  /** The path or URL to the config file */
  pathOrUrl: string,
  /** Information needed before loading the config */
  config: MinimalConfig,
  /** Any overrides to the loaded config */
  overrides?: Resolver<ScaffoldCmdConfig, Partial<Omit<ScaffoldConfig, "name">>>,
): Promise<void> {
  const _cmdConfig: ScaffoldCmdConfig & OptionsBase = {
    dryRun: false,
    output: process.cwd(),
    verbose: LogLevel.Info,
    overwrite: false,
    templates: [],
    createSubFolder: false,
    quiet: false,
    help: false,
    extras: [],
    config: pathOrUrl,
    ...config,
  }
  const _overrides = resolve(overrides, _cmdConfig)
  const _config = await parseConfig(_cmdConfig)
  return Scaffold({ ..._config, ..._overrides })
}

export default Scaffold
