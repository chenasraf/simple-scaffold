import path from "node:path"
import {
  ConfigLoadConfig,
  LogConfig,
  LogLevel,
  RemoteConfigLoadConfig,
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigFile,
  ScaffoldConfigMap,
} from "./types"
import { log } from "./logger"
import { resolve, wrapNoopResolver } from "./utils"
import { getGitConfig } from "./git"
import { isDir, pathExists } from "./fs-utils"
import { wrapBeforeWrite } from "./before-write"

// Re-export for backward compatibility (tests import from here)
export { getOptionValueForFile } from "./file"

/** Parses CLI append-data syntax (`key=value` or `key:=jsonValue`) into a data object. @internal */
export function parseAppendData(value: string, options: ScaffoldCmdConfig): unknown {
  const data = options.data ?? {}
  const [key, val] = value.split(/:?=/)
  if (value.includes(":=") && !val.includes(":=")) {
    return { ...data, [key]: JSON.parse(val) }
  }
  return { ...data, [key]: isWrappedWithQuotes(val) ? val.substring(1, val.length - 1) : val }
}

function isWrappedWithQuotes(string: string): boolean {
  return (
    (string.startsWith('"') && string.endsWith('"')) ||
    (string.startsWith("'") && string.endsWith("'"))
  )
}

/** Loads and resolves a config file (local or remote). @internal */
export async function getConfigFile(config: ScaffoldCmdConfig): Promise<ScaffoldConfigMap> {
  if (config.git && !config.git.includes("://")) {
    log(config, LogLevel.debug, `Loading config from GitHub ${config.git}`)
    config.git = githubPartToUrl(config.git)
  }

  const isGit = Boolean(config.git)
  const configFilename = config.config
  const configPath = isGit ? config.git : configFilename

  log(config, LogLevel.debug, `Loading config from file ${configFilename}`)

  const configPromise = await (isGit
    ? getRemoteConfig({
        git: configPath,
        config: configFilename,
        logLevel: config.logLevel,
        tmpDir: config.tmpDir!,
      })
    : getLocalConfig({ config: configFilename, logLevel: config.logLevel }))

  let configImport = await resolve(configPromise, config)

  if (typeof configImport.default === "function" || configImport.default instanceof Promise) {
    log(config, LogLevel.debug, "Config is a function or promise, resolving...")
    configImport = await resolve(configImport.default, config)
  }
  return configImport
}

/**
 * Parses a CLI config into a full ScaffoldConfig by merging CLI args, config file values,
 * and append-data overrides. @internal
 */
export async function parseConfigFile(config: ScaffoldCmdConfig): Promise<ScaffoldConfig> {
  let output: ScaffoldConfig = {
    name: config.name,
    templates: config.templates ?? [],
    output: config.output,
    logLevel: config.logLevel,
    dryRun: config.dryRun,
    data: config.data,
    subdir: config.subdir,
    overwrite: config.overwrite,
    subdirHelper: config.subdirHelper,
    beforeWrite: undefined,
    tmpDir: config.tmpDir!,
  }

  if (config.quiet) {
    config.logLevel = LogLevel.none
  }

  const shouldLoadConfig = Boolean(config.config || config.git)

  if (shouldLoadConfig) {
    const key = config.key ?? "default"
    const configImport = await getConfigFile(config)

    if (!configImport[key]) {
      throw new Error(`Template "${key}" not found in ${config.config}`)
    }

    const imported = configImport[key]
    log(config, LogLevel.debug, "Imported result", imported)
    output = {
      ...output,
      ...imported,
      beforeWrite: undefined,
      templates: config.templates || imported.templates,
      output: config.output || imported.output,
      data: {
        ...imported.data,
        ...config.data,
      },
    }
  }

  output.data = { ...output.data, ...config.appendData }
  const cmdBeforeWrite = config.beforeWrite
    ? wrapBeforeWrite(config, config.beforeWrite)
    : undefined
  output.beforeWrite = cmdBeforeWrite ?? output.beforeWrite
  if (config.afterScaffold) {
    output.afterScaffold = config.afterScaffold
  }

  if (!output.name) {
    throw new Error("simple-scaffold: Missing required option: name")
  }

  log(output, LogLevel.debug, "Parsed config", output)
  return output
}

/** Converts a GitHub shorthand (user/repo) to a full HTTPS git URL. @internal */
export function githubPartToUrl(part: string): string {
  const gitUrl = new URL(`https://github.com/${part}`)
  if (!gitUrl.pathname.endsWith(".git")) {
    gitUrl.pathname += ".git"
  }
  return gitUrl.toString()
}

/** Loads a scaffold config from a local file or directory. @internal */
export async function getLocalConfig(
  config: ConfigLoadConfig & Partial<LogConfig>,
): Promise<ScaffoldConfigFile> {
  const { config: configFile, ...logConfig } = config as Required<typeof config>

  const absolutePath = path.resolve(process.cwd(), configFile)

  const _isDir = await isDir(absolutePath)

  if (_isDir) {
    log(logConfig, LogLevel.debug, `Resolving config file from directory ${absolutePath}`)
    const file = await findConfigFile(absolutePath)
    const exists = await pathExists(file)
    if (!exists) {
      throw new Error(`Could not find config file in directory ${absolutePath}`)
    }
    log(logConfig, LogLevel.debug, `Loading config from: ${path.resolve(absolutePath, file)}`)
    return wrapNoopResolver(import(path.resolve(absolutePath, file)))
  }

  log(logConfig, LogLevel.debug, `Loading config from: ${absolutePath}`)
  return wrapNoopResolver(import(absolutePath))
}

/** Loads a scaffold config from a remote git repository. @internal */
export async function getRemoteConfig(
  config: RemoteConfigLoadConfig & Partial<LogConfig>,
): Promise<ScaffoldConfigFile> {
  const { config: configFile, git, tmpDir, ...logConfig } = config as Required<typeof config>

  log(
    logConfig,
    LogLevel.debug,
    `Loading config from remote ${git}, config file ${configFile || "<auto-detect>"}`,
  )

  const url = new URL(git!)
  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (!isGit) {
    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return getGitConfig(url, configFile, tmpDir, logConfig)
}

/** Searches for a scaffold config file in the given directory, trying known filenames in order. @internal */
export async function findConfigFile(root: string): Promise<string> {
  const allowed = ["mjs", "cjs", "js", "json"].reduce((acc, ext) => {
    acc.push(`scaffold.config.${ext}`)
    acc.push(`scaffold.${ext}`)
    acc.push(`.scaffold.${ext}`)
    return acc
  }, [] as string[])
  for (const file of allowed) {
    const exists = await pathExists(path.resolve(root, file))
    if (exists) {
      return file
    }
  }
  throw new Error(`Could not find config file in git repo`)
}
