import path from "node:path"
import fs from "node:fs/promises"
import { exec } from "node:child_process"
import { LogConfig, LogLevel, ScaffoldConfig } from "./types"
import { log } from "./logger"
import { createDirIfNotExists, getUniqueTmpPath } from "./fs-utils"

/**
 * Wraps a CLI beforeWrite command string into a beforeWrite callback function.
 * The command receives the processed content via a temp file and can return modified content via stdout.
 * @internal
 */
export function wrapBeforeWrite(
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
      const cmd = await prepareBeforeWriteCmd({
        beforeWrite,
        tmpDir,
        content,
        rawTmpPath,
        rawContent,
      })
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
