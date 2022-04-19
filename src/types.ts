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
  | "date"
  | "hyphenCase"
  | "kebabCase"
  | "lowerCase"
  | "now"
  | "pascalCase"
  | "snakeCase"
  | "startCase"
  | "upperCase"

export type HelperKeys<T> = DefaultHelperKeys | T

export type Helper = Handlebars.HelperDelegate

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

  /**
   * This callback runs right before content is being written to the disk. If you supply this function, you may return
   * a string that represents the final content of your file, you may process the content as you see fit. For example,
   * you may run formatters on a file, fix output in edge-cases not supported by helpers or data, etc.
   *
   * If the return value of this function is `undefined`, the original content will be used.
   *
   * @param content The original template after token replacement
   * @param rawContent The original template before token replacement
   * @param outputPath The final output path of the processed file
   *
   * @returns `String | Buffer | undefined` The final output of the file contents-only, after further modifications -
   * or `undefined` to use the original content (i.e. `content.toString()`)
   */
  beforeWrite?(
    content: Buffer,
    rawContent: Buffer,
    outputPath: string
  ): string | Buffer | undefined | Promise<string | Buffer | undefined>
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
