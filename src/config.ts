import path from "node:path"
import {
  ConfigLoadConfig,
  FileResponse,
  FileResponseHandler,
  LogConfig,
  LogLevel,
  RemoteConfigLoadConfig,
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigFile,
} from "./types"
import { handlebarsParse } from "./parser"
import { log } from "./logger"
import { resolve, wrapNoopResolver } from "./utils"
import { getGitConfig } from "./git"

/** @internal */
export function getOptionValueForFile<T>(
  config: ScaffoldConfig,
  filePath: string,
  fn: FileResponse<T>,
  defaultValue?: T,
): T {
  if (typeof fn !== "function") {
    return defaultValue ?? (fn as T)
  }
  return (fn as FileResponseHandler<T>)(
    filePath,
    path.dirname(handlebarsParse(config, filePath, { isPath: true }).toString()),
    path.basename(handlebarsParse(config, filePath, { isPath: true }).toString()),
  )
}

/** @internal */
export function parseAppendData(value: string, options: ScaffoldCmdConfig): unknown {
  const data = options.data ?? {}
  const [key, val] = value.split(/\:?=/)
  // raw
  if (value.includes(":=") && !val.includes(":=")) {
    return { ...data, [key]: JSON.parse(val) }
  }
  return { ...data, [key]: isWrappedWithQuotes(val) ? val.substring(1, val.length - 1) : val }
}

function isWrappedWithQuotes(string: string): boolean {
  return (string.startsWith('"') && string.endsWith('"')) || (string.startsWith("'") && string.endsWith("'"))
}

/** @internal */
export async function parseConfigFile(config: ScaffoldCmdConfig, tmpPath: string): Promise<ScaffoldConfig> {
  let output: ScaffoldConfig = config

  if (config.quiet) {
    config.logLevel = LogLevel.none
  }

  if (config.git && !config.git.includes("://")) {
    log(config, LogLevel.info, `Loading config from GitHub ${config.git}`)
    config.git = githubPartToUrl(config.git)
  }

  const shouldLoadConfig = config.config || config.git

  if (shouldLoadConfig) {
    const isGit = Boolean(config.git)
    const key = config.key ?? "default"
    const configFilename = config.config
    const configPath = isGit ? config.git : configFilename

    log(config, LogLevel.info, `Loading config from ${configFilename} with key ${key}`)

    const configPromise = await (isGit
      ? getRemoteConfig({ git: configPath, config: configFilename, logLevel: config.logLevel, tmpPath })
      : getLocalConfig({ config: configFilename, logLevel: config.logLevel }))

    // resolve the config
    let configImport = await resolve(configPromise, config)

    // If the config is a function or promise, return the output
    if (typeof configImport.default === "function" || configImport.default instanceof Promise) {
      configImport = await resolve(configImport.default, config)
    }

    if (!configImport[key]) {
      throw new Error(`Template "${key}" not found in ${configFilename}`)
    }

    const importedKey = configImport[key]
    output = {
      ...config,
      ...importedKey,
      data: {
        ...(importedKey as any).data,
        ...config.data,
      },
    }
  }

  output.data = { ...output.data, ...config.appendData }
  delete config.appendData
  return output
}

/** @internal */
export function githubPartToUrl(part: string): string {
  const gitUrl = new URL(`https://github.com/${part}`)
  if (!gitUrl.pathname.endsWith(".git")) {
    gitUrl.pathname += ".git"
  }
  return gitUrl.toString()
}

/** @internal */
export async function getLocalConfig(config: ConfigLoadConfig & Partial<LogConfig>): Promise<ScaffoldConfigFile> {
  const { config: configFile, ...logConfig } = config as Required<typeof config>

  log(logConfig, LogLevel.info, `Loading config from file ${configFile}`)
  const absolutePath = path.resolve(process.cwd(), configFile)
  return wrapNoopResolver(import(absolutePath))
}

/** @internal */
export async function getRemoteConfig(
  config: RemoteConfigLoadConfig & Partial<LogConfig>,
): Promise<ScaffoldConfigFile> {
  const { config: configFile, git, tmpPath, ...logConfig } = config as Required<typeof config>

  log(logConfig, LogLevel.info, `Loading config from remote ${git}, file ${configFile}`)

  const url = new URL(git!)
  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (!isGit) {
    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return getGitConfig(url, configFile, tmpPath, logConfig)
}
