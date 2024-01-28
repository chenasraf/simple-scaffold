import path from "node:path"
import os from "node:os"
import { log } from "./logger"
import { AsyncResolver, LogConfig, LogLevel, ScaffoldCmdConfig, ScaffoldConfigMap } from "./types"
import { spawn } from "node:child_process"
import { resolve, wrapNoopResolver } from "./utils"

export async function getGitConfig(
  url: URL,
  file: string,
  logConfig: LogConfig,
): Promise<AsyncResolver<ScaffoldCmdConfig, ScaffoldConfigMap>> {
  const repoUrl = `${url.protocol}//${url.host}${url.pathname}`

  log(logConfig, LogLevel.info, `Cloning git repo ${repoUrl}`)

  const tmpPath = path.resolve(os.tmpdir(), `scaffold-config-${Date.now()}`)

  return new Promise((res, reject) => {
    const clone = spawn("git", ["clone", "--recurse-submodules", "--depth", "1", repoUrl, tmpPath])

    clone.on("error", reject)
    clone.on("close", async (code) => {
      if (code === 0) {
        log(logConfig, LogLevel.info, `Loading config from git repo: ${repoUrl}`)
        // TODO search for dynamic config file in repo if not provided
        const filename = file || "scaffold.config.js"
        const absolutePath = path.resolve(tmpPath, filename)
        const loadedConfig = await resolve(
          async () => (await import(absolutePath)).default as ScaffoldConfigMap,
          logConfig,
        )

        log(logConfig, LogLevel.info, `Loaded config from git`)
        log(logConfig, LogLevel.debug, `Raw config:`, loadedConfig)
        const fixedConfig: ScaffoldConfigMap = {}
        for (const [k, v] of Object.entries(loadedConfig)) {
          fixedConfig[k] = {
            ...v,
            templates: v.templates.map((t) => path.resolve(tmpPath, t)),
          }
        }
        res(wrapNoopResolver(fixedConfig))
        return
      }

      reject(new Error(`Git clone failed with code ${code}`))
    })
  })
}
