import { HelperDelegate } from "handlebars/runtime"

/**
 * The config object for defining a scaffolding group.
 *
 * @see {@link https://chenasraf.github.io/simple-scaffold/pages/node.html | Node.js usage}
 * @see {@link https://chenasraf.github.io/simple-scaffold/pages/cli.html | CLI usage}
 * @see {@link DefaultHelpers}
 * @see {@link CaseHelpers}
 * @see {@link DateHelpers}
 *
 * @category Config
 */
export interface ScaffoldConfig {
  /**
   * Name to be passed to the generated files. `{{name}}` and `{{Name}}` inside contents and file names will be replaced
   * accordingly.
   */
  name: string

  /**
   * Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path,
   * or a glob pattern for multiple file matching easily.
   *
   * @default Current working directory
   */
  templates: string[]

  /**
   * Path to output to. If `createSubFolder` is `true`, the subfolder will be created inside this path.
   *
   * May also be a {@link FileResponseHandler} which returns a new output path to override the default one.
   *
   * @see {@link FileResponse}
   * @see {@link FileResponseHandler}
   */
  output: FileResponse<string>

  /**
   * Whether to create subfolder with the input name.
   *
   * When `true`, you may also use {@link subFolderNameHelper} to determine a pre-process helper on
   * the directory name.
   *
   * @default `false`
   */
  createSubFolder?: boolean

  /**
   * Add custom data to the templates. By default, only your app name is included as `{{name}}` and `{{Name}}`.
   *
   * This can be any object that will be usable by Handlebars.
   */
  data?: Record<string, any>

  /**
   * Enable to override output files, even if they already exist.
   *
   * You may supply a function to this option, which can take the arguments `(fullPath, baseDir, baseName)` and returns
   * a boolean for each file.
   *
   * May also be a {@link FileResponseHandler} which returns a boolean value per file.
   *
   * @see {@link FileResponse}
   * @see {@link FileResponseHandler}
   *
   * @default `false`
   */
  overwrite?: FileResponse<boolean>

  /**
   * Suppress output logs (Same as `verbose: 0` or `verbose: LogLevel.None`)
   *  @see {@link verbose}
   */
  quiet?: boolean

  /**
   * Determine amount of logs to display.
   *
   * The values are: `0 (none) | 1 (debug) | 2 (info) | 3 (warn) | 4 (error)`. The provided level will display messages
   * of the same level or higher.
   *
   * @see {@link LogLevel}
   *
   * @default `2 (info)`
   */
  verbose?: LogLevel

  /**
   * Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write
   * actual file contents or create directories.
   *
   * @default `false`
   */
  dryRun?: boolean

  /**
   * Additional helpers to add to the template parser. Provide an object whose keys are the name of the function to add,
   * and the value is the helper function itself. The signature of helpers is as follows:
   * ```typescript
   * (text: string, ...args: any[]) => string
   * ```
   *
   * A full example might be:
   *
   * ```typescript
   * Scaffold({
   *   //...
   *   helpers: {
   *     upperKebabCase: (text) => kebabCase(text).toUpperCase()
   *   }
   * })
   * ```
   *
   * Which will allow:
   *
   * ```
   * {{ upperKebabCase "my value" }}
   * ```
   *
   * To transform to:
   *
   * ```
   * MY-VALUE
   * ```
   *
   * See {@link DefaultHelpers} for a list of all the built-in available helpers.
   *
   * Simple Scaffold uses Handlebars.js, so all the syntax from there is supported. See
   * [their docs](https://handlebarsjs.com/guide/#custom-helpers) for more information.
   *
   * @see {@link DefaultHelpers}
   * @see {@link CaseHelpers}
   * @see {@link DateHelpers}
   * @see {@link https://chenasraf.github.io/simple-scaffold/pages/templates.html | Templates}
   * */
  helpers?: Record<string, Helper>

  /**
   * Default transformer to apply to subfolder name when using `createSubFolder: true`. Can be one of the default
   * capitalization helpers, or a custom one you provide to `helpers`. Defaults to `undefined`, which means no
   * transformation is done.
   *
   * @see {@link createSubFolder}
   * @see {@link CaseHelpers}
   * @see {@link DefaultHelpers}
   */
  subFolderNameHelper?: DefaultHelpers | string

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
   * @returns {Promise<String | Buffer | undefined> | String | Buffer | undefined} The final output of the file
   * contents-only, after further modifications - or `undefined` to use the original content (i.e. `content.toString()`)
   */
  beforeWrite?(
    content: Buffer,
    rawContent: Buffer,
    outputPath: string,
  ): string | Buffer | undefined | Promise<string | Buffer | undefined>
}

/**
 * The names of the available helper functions that relate to text capitalization.
 *
 * These are available for `subfolderNameHelper`.
 *
 * | Helper name  | Example code            | Example output |
 * | ------------ | ----------------------- | -------------- |
 * | [None]       | `{{ name }}`            | my name        |
 * | `camelCase`  | `{{ camelCase name }}`  | myName         |
 * | `snakeCase`  | `{{ snakeCase name }}`  | my_name        |
 * | `startCase`  | `{{ startCase name }}`  | My Name        |
 * | `kebabCase`  | `{{ kebabCase name }}`  | my-name        |
 * | `hyphenCase` | `{{ hyphenCase name }}` | my-name        |
 * | `pascalCase` | `{{ pascalCase name }}` | MyName         |
 * | `upperCase`  | `{{ upperCase name }}`  | MY NAME        |
 * | `lowerCase`  | `{{ lowerCase name }}`  | my name        |
 *
 * @see {@link DefaultHelpers}
 * @see {@link DateHelpers}
 * @see {@link ScaffoldConfig}
 * @see {@link ScaffoldConfig.subFolderNameHelper}
 *
 * @category Helpers
 */
export type CaseHelpers =
  | "camelCase"
  | "hyphenCase"
  | "kebabCase"
  | "lowerCase"
  | "pascalCase"
  | "snakeCase"
  | "startCase"
  | "upperCase"

/**
 * The names of the available helper functions that relate to dates.
 *
 * | Helper name                      | Description                                                      | Example code                                                     | Example output     |
 * | -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
 * | `now`                            | Current date with format                                         | `{{ now "yyyy-MM-dd HH:mm" }}`                                   | `2042-01-01 15:00` |
 * | `now` (with offset)              | Current date with format, and with offset                        | `{{ now "yyyy-MM-dd HH:mm" -1 "hours" }}`                        | `2042-01-01 14:00` |
 * | `date`                           | Custom date with format                                          | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" }}`           | `2042-01-01 15:00` |
 * | `date` (with offset)             | Custom date with format, and with offset                         | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" -1 "days" }}` | `2041-31-12 15:00` |
 * | `date` (with date from `--data`) | Custom date with format, with data from the `data` config option | `{{ date myCustomDate "yyyy-MM-dd HH:mm" }}`                     | `2042-01-01 12:00` |
 *
 * Further details:
 *
 * - We use [`date-fns`](https://date-fns.org/docs/) for parsing/manipulating the dates. If you want
 *   more information on the date tokens to use, refer to
 *   [their format documentation](https://date-fns.org/docs/format).
 *
 * - The date helper format takes the following arguments:
 *
 *   ```typescript
 *   (
 *     date: string,
 *     format: string,
 *     offsetAmount?: number,
 *     offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"
 *   )
 *   ```
 *
 * - **The now helper** (for current time) takes the same arguments, minus the first one (`date`) as it is implicitly
 *   the current date.
 *
 * @see {@link DefaultHelpers}
 * @see {@link CaseHelpers}
 * @see {@link ScaffoldConfig}
 *
 * @category Helpers
 */
export type DateHelpers = "date" | "now"

/**
 * The names of all the available helper functions in templates.
 * Simple-Scaffold provides some built-in text transformation filters usable by Handlebars.js.
 *
 * For example, you may use `{{ snakeCase name }}` inside a template file or filename, and it will
 * replace `My Name` with `my_name` when producing the final value.
 *
 * @see {@link CaseHelpers}
 * @see {@link DateHelpers}
 * @see {@link ScaffoldConfig}
 *
 * @category Helpers
 */
export type DefaultHelpers = CaseHelpers | DateHelpers

/**
 * Helper function, see https://handlebarsjs.com/guide/#custom-helpers
 *
 * @category Helpers
 */
export type Helper = HelperDelegate

/**
 * The amount of information to log when generating scaffold.
 * When not `None`, the selected level will be the lowest level included.
 *
 * For example, level `Info` (2) will include `Info`, `Warning` and `Error`, but not `Debug`; and `Warning` will only
 * show `Warning` and `Error`.
 *
 * @default `2 (info)`
 *
 * @category Logging
 */
export enum LogLevel {
  /** Silent output */
  None = 0,
  /** Debugging information. Very verbose and only recommended for troubleshooting. */
  Debug = 1,
  /**
   * The regular level of logging. Major actions are logged to show the scaffold progress.
   *
   * @default
   */
  Info = 2,
  /** Warnings such as when file fails to replace token values properly in template. */
  Warning = 3,
  /** Errors, such as missing files, bad replacement token syntax, or un-writable directories. */
  Error = 4,
}

/**
 * A function that takes path information about file, and returns a value of type `T`
 *
 * @template T The return type for the function
 * @param {string} fullPath The full path of the current file
 * @param {string} basedir The directory containing the current file
 * @param {string} basename The name of the file
 *
 * @returns {T} A return value
 *
 * @category Config
 */
export type FileResponseHandler<T> = (fullPath: string, basedir: string, basename: string) => T

/**
 * Represents a response for file path information.
 * Can either be:
 *
 * 1. `T` - static value
 * 2. A function with the following signature which returns `T`:
 *    ```typescript
 *    (fullPath: string, basedir: string, basename: string) => T
 *    ```
 *
 * @typedef T The return type
 *
 * @see {@link FileResponseHandler}
 *
 * @category Config
 * */
export type FileResponse<T> = T | FileResponseHandler<T>

/** @internal */
export interface ScaffoldCmdConfig {
  /**
   * Name to be passed to the generated files. `{{name}}` and `{{Name}}` inside contents and file names will be replaced
   * accordingly.
   */
  name: string
  templates: string[]
  output: string
  createSubFolder: boolean
  data?: Record<string, string>
  appendData?: Record<string, string>
  overwrite: boolean
  quiet: boolean
  verbose: LogLevel
  dryRun: boolean
  config?: string
  /** The key to use for the file which contains the template configurations. */
  key?: string
  github?: string
}

/**
 * A mapping of scaffold template keys to their configurations.
 *
 * Each configuration is a {@link ScaffoldConfig} object.
 *
 * The key is the name of the template, and the value is the configuration for that template.
 *
 * When no template key is provided to the scaffold command, the "default" template is used.
 *
 * @see {@link ScaffoldConfig}
 */
export type ScaffoldConfigFile = Record<string, ScaffoldConfig>
