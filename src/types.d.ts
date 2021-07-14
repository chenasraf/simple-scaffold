export type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export interface ScaffoldConfig {
  name: string
  templates: string[]
  outputPath: FileResponse<string>
  createSubfolder?: boolean
  data?: Record<string, string>
  overwrite?: FileResponse<boolean>
  silent?: boolean
}
