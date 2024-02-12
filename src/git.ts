import path from "node:path"
import { log } from "./logger"
import { AsyncResolver, LogConfig, LogLevel, ScaffoldCmdConfig, ScaffoldConfigMap } from "./types"
import { spawn } from "node:child_process"
import { resolve, wrapNoopResolver } from "./utils"
import { findConfigFile } from "./config"

export async function getGitConfig(
  url: URL,
  file: string,
  tmpPath: string,
  logConfig: LogConfig,
): Promise<AsyncResolver<ScaffoldCmdConfig, ScaffoldConfigMap>> {
  const repoUrl = `${url.protocol}//${url.host}${url.pathname}`

  log(logConfig, LogLevel.info, `Cloning git repo ${repoUrl}`)

  return new Promise((res, reject) => {
    log(logConfig, LogLevel.debug, `Cloning git repo to ${tmpPath}`)
    const clone = spawn("git", ["clone", "--recurse-submodules", "--depth", "1", repoUrl, tmpPath])

    clone.on("error", reject)
    clone.on("close", async (code) => {
      if (code === 0) {
        res(await loadGitConfig({ logConfig, url: repoUrl, file, tmpPath }))
        return
      }

      reject(new Error(`Git clone failed with code ${code}`))
    })
  })
}

/** @internal */
export async function loadGitConfig({
  logConfig,
  url: repoUrl,
  file,
  tmpPath,
}: {
  logConfig: LogConfig
  url: string
  file: string
  tmpPath: string
}): Promise<AsyncResolver<ScaffoldCmdConfig, ScaffoldConfigMap>> {
  log(logConfig, LogLevel.info, `Loading config from git repo: ${repoUrl}`)
  const filename = file || (await findConfigFile(tmpPath))
  const absolutePath = path.resolve(tmpPath, filename)
  log(logConfig, LogLevel.debug, `Resolving config file: ${absolutePath}`)
  const loadedConfig = await resolve(async () => (await import(absolutePath)).default as ScaffoldConfigMap, logConfig)

  log(logConfig, LogLevel.info, `Loaded config from git`)
  log(logConfig, LogLevel.debug, `Raw config:`, loadedConfig)
  const fixedConfig: ScaffoldConfigMap = {}
  for (const [k, v] of Object.entries(loadedConfig)) {
    fixedConfig[k] = {
      ...v,
      templates: v.templates.map((t) => path.resolve(tmpPath, t)),
    }
  }
  return wrapNoopResolver(fixedConfig)
}
