import path from "node:path"
import fs from "node:fs/promises"
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
  ScaffoldConfigMap,
} from "./types"
import { handlebarsParse } from "./parser"
import { log } from "./logger"
import { resolve, wrapNoopResolver } from "./utils"
import { getGitConfig } from "./git"
import { createDirIfNotExists, getUniqueTmpPath, isDir, pathExists } from "./file"
import { exec } from "node:child_process"

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
    path.dirname(handlebarsParse(config, filePath, { asPath: true }).toString()),
    path.basename(handlebarsParse(config, filePath, { asPath: true }).toString()),
  )
}

/** @internal */
export function parseAppendData(value: string, options: ScaffoldCmdConfig): unknown {
  const data = options.data ?? {}
  const [key, val] = value.split(/:?=/)
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
export async function getConfigFile(config: ScaffoldCmdConfig): Promise<ScaffoldConfigMap> {
  if (config.git && !config.git.includes("://")) {
    log(config, LogLevel.info, `Loading config from GitHub ${config.git}`)
    config.git = githubPartToUrl(config.git)
  }

  const isGit = Boolean(config.git)
  const configFilename = config.config
  const configPath = isGit ? config.git : configFilename

  log(config, LogLevel.info, `Loading config from file ${configFilename}`)

  const configPromise = await (isGit
    ? getRemoteConfig({ git: configPath, config: configFilename, logLevel: config.logLevel, tmpDir: config.tmpDir! })
    : getLocalConfig({ config: configFilename, logLevel: config.logLevel }))

  // resolve the config
  let configImport = await resolve(configPromise, config)

  // If the config is a function or promise, return the output
  if (typeof configImport.default === "function" || configImport.default instanceof Promise) {
    log(config, LogLevel.debug, "Config is a function or promise, resolving...")
    configImport = await resolve(configImport.default, config)
  }
  return configImport
}

/** @internal */
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
  const cmdBeforeWrite = config.beforeWrite ? wrapBeforeWrite(config, config.beforeWrite) : undefined
  output.beforeWrite = cmdBeforeWrite ?? output.beforeWrite

  if (!output.name) {
    throw new Error("simple-scaffold: Missing required option: name")
  }

  log(output, LogLevel.debug, "Parsed config", output)
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

  const absolutePath = path.resolve(process.cwd(), configFile)

  const _isDir = await isDir(absolutePath)

  if (_isDir) {
    log(logConfig, LogLevel.debug, `Resolving config file from directory ${absolutePath}`)
    const file = await findConfigFile(absolutePath)
    const exists = await pathExists(file)
    if (!exists) {
      throw new Error(`Could not find config file in directory ${absolutePath}`)
    }
    log(logConfig, LogLevel.info, `Loading config from: ${path.resolve(absolutePath, file)}`)
    return wrapNoopResolver(import(path.resolve(absolutePath, file)))
  }

  log(logConfig, LogLevel.info, `Loading config from: ${absolutePath}`)
  return wrapNoopResolver(import(absolutePath))
}

/** @internal */
export async function getRemoteConfig(
  config: RemoteConfigLoadConfig & Partial<LogConfig>,
): Promise<ScaffoldConfigFile> {
  const { config: configFile, git, tmpDir, ...logConfig } = config as Required<typeof config>

  log(logConfig, LogLevel.info, `Loading config from remote ${git}, config file ${configFile || "<auto-detect>"}`)

  const url = new URL(git!)
  const isHttp = url.protocol === "http:" || url.protocol === "https:"
  const isGit = url.protocol === "git:" || (isHttp && url.pathname.endsWith(".git"))

  if (!isGit) {
    throw new Error(`Unsupported protocol ${url.protocol}`)
  }

  return getGitConfig(url, configFile, tmpDir, logConfig)
}

/** @internal */
export async function findConfigFile(root: string): Promise<string> {
  const allowed = ["mjs", "cjs", "js", "json"].reduce((acc, ext) => {
    acc.push(`scaffold.config.${ext}`)
    acc.push(`scaffold.${ext}`)
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

function wrapBeforeWrite(
  config: LogConfig & Pick<ScaffoldConfig, "dryRun">,
  beforeWrite: string,
): ScaffoldConfig["beforeWrite"] {
  return async (content, rawContent, outputFile) => {
    const tmpDir = path.join(getUniqueTmpPath(), path.basename(outputFile))
    await createDirIfNotExists(path.dirname(tmpDir), config)
    const ext = path.extname(outputFile)
    const rawTmpPath = tmpDir.replace(ext, ".raw" + ext)
    try {
      log(config, LogLevel.debug, "Parsing beforeWrite command", beforeWrite)
      const cmd = await prepareBeforeWriteCmd({ beforeWrite, tmpDir, content, rawTmpPath, rawContent })
      const result = await new Promise<string | undefined>((resolve, reject) => {
        log(config, LogLevel.debug, "Running parsed beforeWrite command:", cmd)
        const proc = exec(cmd)
        proc.stdout!.on("data", (data) => {
          if (data.trim()) {
            resolve(data.toString())
          } else {
            resolve(undefined)
          }
        })
        proc.stderr!.on("data", (data) => {
          reject(data.toString())
        })
      })
      return result
    } catch (e) {
      log(config, LogLevel.debug, e)
      log(config, LogLevel.warning, "Error running beforeWrite command, returning original content")
      return undefined
    } finally {
      await fs.rm(tmpDir, { force: true })
      await fs.rm(rawTmpPath, { force: true })
    }
  }
}

async function prepareBeforeWriteCmd({
  beforeWrite,
  tmpDir,
  content,
  rawTmpPath,
  rawContent,
}: {
  beforeWrite: string
  tmpDir: string
  content: Buffer
  rawTmpPath: string
  rawContent: Buffer
}): Promise<string> {
  let cmd: string = ""
  const pathReg = /\{\{\s*path\s*\}\}/gi
  const rawPathReg = /\{\{\s*rawpath\s*\}\}/gi
  if (pathReg.test(beforeWrite)) {
    await fs.writeFile(tmpDir, content)
    cmd = beforeWrite.replaceAll(pathReg, tmpDir)
  }
  if (rawPathReg.test(beforeWrite)) {
    await fs.writeFile(rawTmpPath, rawContent)
    cmd = beforeWrite.replaceAll(rawPathReg, rawTmpPath)
  }
  if (!cmd) {
    await fs.writeFile(tmpDir, content)
    cmd = [beforeWrite, tmpDir].join(" ")
  }
  return cmd
}
