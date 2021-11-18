export type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export interface ScaffoldConfig {
  /** The name supplied for the output templates */
  name: string
  templates: string[]
  output: FileResponse<string>
  createSubFolder?: boolean
  data?: Record<string, string>
  overwrite?: FileResponse<boolean>
  quiet?: boolean
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