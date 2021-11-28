export enum LogLevel {
  None = 0,
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
}

export type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export interface ScaffoldConfig {
  /** The name supplied for the output templates */
  name: string
  /** Template input files/dirs/glob patterns to use as template input. These will be copied to the output directory. */
  templates: string[]
  /** Output directory to put scaffolded files in. */
  output: FileResponse<string>
  createSubFolder?: boolean
  data?: Record<string, string>
  overwrite?: FileResponse<boolean>
  quiet?: boolean
  verbose?: LogLevel
  dryRun?: boolean
}
export interface ScaffoldCmdConfig {
  name: string
  templates: string[]
  output: string
  createSubFolder: boolean
  data?: Record<string, string>
  overwrite: boolean
  quiet: boolean
  dryRun: boolean
}
