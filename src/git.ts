import path from "node:path"
import os from "node:os"
import { log } from "./logger"
import { AsyncResolver, LogConfig, LogLevel, ScaffoldCmdConfig, ScaffoldConfigMap } from "./types"
import { spawn } from "node:child_process"
import { wrapNoopResolver } from "./utils"

export async function getGitConfig(
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
        return
      }

      reject(new Error(`Git clone failed with code ${code}`))
    })
  })
}
