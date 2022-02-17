export enum LogLevel {
  None = 0,
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
}

export type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T

export type FileResponse<T> = T | FileResponseFn<T>

export type DefaultHelperKeys =
  | "camelCase"
  | "snakeCase"
  | "startCase"
  | "kebabCase"
  | "hyphenCase"
  | "pascalCase"
  | "lowerCase"
  | "upperCase"

export type HelperKeys<T> = DefaultHelperKeys | T

export type Helper = (text: string) => string

export interface ScaffoldConfig {
  /**
   * Name to be passed to the generated files. `{{name}}` and `{{Name}}` inside contents and file names will be replaced
   * accordingly.
   */
  name: string

  /**
   * Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path,
   * or a glob pattern for multiple file matching easily. (default: current working directory)
   */
  templates: string[]

  /** Path to output to. If `createSubFolder` is `true`, the subfolder will be created inside this path. */
  output: FileResponse<string>

  /**
   * Create subfolder with the input name (default: `false`)
   */
  createSubFolder?: boolean

  /**
   * Add custom data to the templates. By default, only your app name is included as `{{name}}` and `{{Name}}`.
   */
  data?: Record<string, string>

  /**
   * Enable to override output files, even if they already exist. (default: `false`)
   *
   * You may supply a function to this option, which can take the arguments `(fullPath, baseDir, baseName)` and returns
   * a string, to return a dynamic path for each file.
   */
  overwrite?: FileResponse<boolean>

  /** Suppress output logs (Same as `verbose: 0` or `verbose: LogLevel.None`) */
  quiet?: boolean

  /**
   * Determine amount of logs to display.
   *
   * The values are: `0 (none) | 1 (debug) | 2 (info) | 3 (warn) | 4 (error)`. The provided level will display messages
   * of the same level or higher. (default: `2 (info)`)
   * @see LogLevel
   */
  verbose?: LogLevel

  /**
   * Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write
   * actual file contents or create directories. (default: `false`)
   */
  dryRun?: boolean

  /**
   * Additional helpers to add to the template parser. Provide an object whose keys are the name of the function to add,
   * and the value is the helper function itself. The signature of helpers is as follows:
   * ```typescript
   * (text: string) => string
   * ```
   *
   * A full example might be:
   *
   * ```typescript
   * Scaffold({
   *   //...
   *   helpers: {
   *     upperCamelCase: (text) => camelCase(text).toUpperCase()
   *   }
   * })
   * ```
   *
   * Here are the built-in helpers available for use:
   * | Helper name | Example code            | Example output |
   * | ----------- | ----------------------- | -------------- |
   * | camelCase   | `{{ camelCase name }}`  | myName         |
   * | snakeCase   | `{{ snakeCase name }}`  | my_name        |
   * | startCase   | `{{ startCase name }}`  | My Name        |
   * | kebabCase   | `{{ kebabCase name }}`  | my-name        |
   * | hyphenCase  | `{{ hyphenCase name }}` | my-name        |
   * | pascalCase  | `{{ pascalCase name }}` | MyName         |
   * | upperCase   | `{{ upperCase name }}`  | MYNAME         |
   * | lowerCase   | `{{ lowerCase name }}`  | myname         |
   */
  helpers?: Record<string, Helper>

  /**
   * Default transformer to apply to subfolder name when using `createSubFolder: true`. Can be one of the default
   * helpers, or a custom one you provide to `helpers`. Defaults to `undefined`, which means no transformation is done.
   */
  subFolderNameHelper?: DefaultHelperKeys | string
}
export interface ScaffoldCmdConfig {
  name: string
  templates: string[]
  output: string
  createSubFolder: boolean
  data?: Record<string, string>
  overwrite: boolean
  quiet: boolean
  verbose: LogLevel
  dryRun: boolean
}
