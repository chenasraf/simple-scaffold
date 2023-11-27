import path from "node:path"
import {
  ConfigLoadConfig,
  FileResponse,
  FileResponseHandler,
  LogLevel,
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigFile,
} from "./types"
import { handlebarsParse } from "./parser"
import { log } from "./logger"
import { resolve, wrapNoopResolver } from "./utils"
import { getGitConfig } from "./git"

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
export async function parseConfigFile(config: ScaffoldCmdConfig): Promise<ScaffoldConfig> {
  let c: ScaffoldConfig = config
  if (config.github) {
    log(config, LogLevel.Info, `Loading config from github ${config.github}`)
    config.config = githubPartToUrl(config.github)
  }

  if (config.config) {
    const { configFile, key, isRemote } = parseConfigSelection(config.config, config.key)
    log(config, LogLevel.Info, `Loading config from ${configFile} with key ${key}`)
    const configPromise = await getConfig({
      config: configFile,
      isRemote,
      quiet: config.quiet,
      verbose: config.verbose,
    })
    let configImport = await resolve(configPromise, config)
    if (typeof configImport.default === "function" || configImport.default instanceof Promise) {
      configImport = await resolve(configImport.default, config)
    }
    if (!configImport[key]) {
      throw new Error(`Template "${key}" not found in ${configFile}`)
    }
    const importedKey = configImport[key]
    c = {
      ...config,
      ...importedKey,
      data: {
        ...(importedKey as any).data,
        ...config.data,
      },
    }
  }

  c.data = { ...c.data, ...config.appendData }
  delete config.appendData
  return c
}

export function parseConfigSelection(
  config: string,
  key?: string,
): { configFile: string; key: string; isRemote: boolean } {
  const isUrl = config.includes("://")

  const hasColonToken = (!isUrl && config.includes(":")) || (isUrl && count(config, ":") > 1)
  const colonIndex = config.lastIndexOf(":")
  const [configFile, templateKey = "default"] = hasColonToken
    ? [config.substring(0, colonIndex), config.substring(colonIndex + 1)]
    : [config, undefined]
  const _key = (key ?? templateKey) || "default"
  return { configFile, key: _key, isRemote: isUrl }
}

export function githubPartToUrl(part: string): string {
  const gitUrl = new URL(`https://github.com/${part}`)
  if (!gitUrl.pathname.endsWith(".git")) {
    gitUrl.pathname += ".git"
  }
  return gitUrl.toString()
}

/** @internal */
export async function getConfig(config: ConfigLoadConfig): Promise<ScaffoldConfigFile> {
  const { config: configFile, isRemote, ...logConfig } = config as Required<typeof config>

  if (!isRemote) {
    log(logConfig, LogLevel.Info, `Loading config from file ${configFile}`)
    const absolutePath = path.resolve(process.cwd(), configFile)
    return wrapNoopResolver(import(absolutePath))
  }

  const url = new URL(configFile)
  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (isGit) {
    return getGitConfig(url, logConfig)
  }

  if (!isHttp) {
    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return wrapNoopResolver(import(path.resolve(process.cwd(), configFile)))
}

function count(string: string, substring: string): number {
  return string.split(substring).length - 1
}
