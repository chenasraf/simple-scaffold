export type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export interface ScaffoldConfig {
  name: string
  templates: string[]
  output: FileResponse<string>
  createSubFolder?: boolean
  data?: Record<string, string>
  overwrite?: FileResponse<boolean>
  silent?: boolean
  dryRun?: boolean
}
export interface ScaffoldCmdConfig {
  name: string
  templates: string[]
  output: string
  createSubFolder: boolean
  data?: Record<string, string>
  overwrite: boolean
  silent: boolean
  dryRun: boolean
}
