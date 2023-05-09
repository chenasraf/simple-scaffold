import path from "path"
import {
  AsyncResolver,
  ConfigLoadConfig,
  FileResponse,
  FileResponseHandler,
  LogConfig,
  LogLevel,
  Resolver,
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigFile,
  ScaffoldConfigMap,
} from "./types"
import { OptionsBase } from "massarg/types"
import { spawn } from "node:child_process"
import os from "node:os"
import { handlebarsParse } from "./parser"
import { log } from "./logger"
import { resolve } from "./utils"

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

export function parseAppendData(value: string, options: ScaffoldCmdConfig & OptionsBase): unknown {
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
export async function parseConfig(config: ScaffoldCmdConfig & OptionsBase): Promise<ScaffoldConfig> {
  let c: ScaffoldConfig = config
  if (config.github) {
    log(config, LogLevel.Info, `Loading config from github ${config.github}`)
    const gitUrl = new URL(`https://github.com/${config.github}`)
    if (!gitUrl.pathname.endsWith(".git")) {
      gitUrl.pathname += ".git"
    }
    config.config = gitUrl.toString()
  }

  if (config.config) {
    const isUrl = config.config.includes("://")

    const hasColonToken = (!isUrl && config.config.includes(":")) || (isUrl && count(config.config, ":") > 1)
    const colonIndex = config.config.lastIndexOf(":")
    const [configFile, templateKey = "default"] = hasColonToken
      ? [config.config.substring(0, colonIndex), config.config.substring(colonIndex + 1)]
      : [config.config, undefined]
    const key = (config.key ?? templateKey) || "default"
    log(config, LogLevel.Info, `Loading config from ${configFile} with key ${key}`)
    const configPromise = await getConfig({ config: configFile, quiet: config.quiet, verbose: config.verbose })
    const configImport = await resolve(configPromise, config)

    if (!configImport[key]) {
      throw new Error(`Template "${key}" not found in ${configFile}`)
    }
    c = {
      ...config,
      ...configImport[key],
      data: {
        ...configImport[key].data,
        ...config.data,
      },
    }
  }

  c.data = { ...c.data, ...config.appendData }
  delete config.appendData
  return c
}

function wrapNoopResolver<T, R = T>(value: Resolver<T, R>): Resolver<T, R> {
  if (typeof value === "function") {
    return value
  }

  return (_) => value
}

/** @internal */
export async function getConfig(config: ConfigLoadConfig): Promise<ScaffoldConfigFile> {
  const { config: configFile, ...logConfig } = config as Required<typeof config>
  const url = new URL(configFile)

  if (url.protocol === "file:") {
    log(logConfig, LogLevel.Info, `Loading config from file ${configFile}`)
    const absolutePath = path.resolve(process.cwd(), configFile)
    return wrapNoopResolver(import(absolutePath))
  }

  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (isHttp || isGit) {
    if (isGit) {
      return getGitConfig(url, logConfig)
    }

    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return wrapNoopResolver(import(path.resolve(process.cwd(), configFile)))
}

async function getGitConfig(
  url: URL,
  logConfig: LogConfig,
): Promise<AsyncResolver<ScaffoldCmdConfig, ScaffoldConfigMap>> {
  const repoUrl = `${url.protocol}//${url.host}${url.pathname}`

  log(logConfig, LogLevel.Info, `Cloning git repo ${repoUrl}`)

  const tmpPath = path.resolve(os.tmpdir(), `scaffold-config-${Date.now()}`)

  return new Promise((resolve, reject) => {
    const clone = spawn("git", ["clone", "--depth", "1", repoUrl, tmpPath])

    clone.on("error", reject)
    clone.on("close", async (code) => {
      if (code === 0) {
        log(logConfig, LogLevel.Info, `Loading config from git repo: ${repoUrl}`)
        const hashPath = url.hash?.replace("#", "") || "scaffold.config.js"
        const absolutePath = path.resolve(tmpPath, hashPath)
        const loadedConfig = (await import(absolutePath)).default as ScaffoldConfigMap
        log(logConfig, LogLevel.Info, `Loaded config from git`)
        log(logConfig, LogLevel.Debug, `Raw config:`, loadedConfig)
        const fixedConfig: ScaffoldConfigMap = Object.fromEntries(
          Object.entries(loadedConfig).map(([k, v]) => [
            k,
            // use absolute paths for template as config is necessarily in another directory
            { ...v, templates: v.templates.map((t) => path.resolve(tmpPath, t)) },
          ]),
        )

        resolve(wrapNoopResolver(fixedConfig))
      } else {
        reject(new Error(`Git clone failed with code ${code}`))
      }
    })
  })
}

function count(string: string, substring: string): number {
  return string.split(substring).length - 1
}
