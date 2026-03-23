#!/usr/bin/env node

import path from "node:path"
import fs from "node:fs/promises"
import { massarg } from "massarg"
import { ListCommandCliOptions, LogLevel, ScaffoldCmdConfig, ScaffoldConfigMap } from "./types"
import { Scaffold } from "./scaffold"
import { findConfigFile, getConfigFile, parseAppendData, parseConfigFile } from "./config"
import { log } from "./logger"
import { MassargCommand } from "massarg/command"
import { getUniqueTmpPath as generateUniqueTmpPath } from "./file"
import { colorize } from "./colors"
import { promptForMissingConfig, resolveInputs } from "./prompts"
import { initScaffold } from "./init"

export async function parseCliArgs(args = process.argv.slice(2)) {
  const isProjectRoot = Boolean(
    await fs.stat(path.join(__dirname, "package.json")).catch(() => false),
  )
  const pkgFile = await fs.readFile(
    path.resolve(__dirname, isProjectRoot ? "." : "..", "package.json"),
  )
  const pkg = JSON.parse(pkgFile.toString())
  return massarg<ScaffoldCmdConfig>({
    name: pkg.name,
    description: pkg.description,
  })
    .main(async (config) => {
      if (config.version) {
        console.log(pkg.version)
        return
      }
      log(config, LogLevel.info, `Simple Scaffold v${pkg.version}`)
      config.tmpDir = generateUniqueTmpPath()
      try {
        // Auto-detect config file in cwd if not explicitly provided
        if (!config.config && !config.git) {
          try {
            config.config = await findConfigFile(process.cwd())
            log(config, LogLevel.debug, `Auto-detected config file: ${config.config}`)
          } catch {
            // No config file found — that's fine, continue without one
          }
        }

        // Load config early so we can prompt for template key
        const hasConfigSource = Boolean(config.config || config.git)
        let configMap: ScaffoldConfigMap | undefined
        if (hasConfigSource) {
          configMap = await getConfigFile(config)
        }

        // Prompt for missing values interactively
        config = await promptForMissingConfig(config, configMap)

        log(config, LogLevel.debug, "Parsing config file...", config)
        const parsed = await parseConfigFile(config)
        const resolved = await resolveInputs(parsed)
        await Scaffold(resolved)
      } catch (e) {
        const message = "message" in (e as object) ? (e as Error).message : e?.toString()
        log(config, LogLevel.error, message)
      } finally {
        log(config, LogLevel.debug, "Cleaning up temporary files...", config.tmpDir)
        if (config.tmpDir) await fs.rm(config.tmpDir, { recursive: true, force: true })
      }
    })
    .option({
      name: "name",
      aliases: ["n"],
      description:
        "Name to be passed to the generated files. `{{name}}` and other data parameters inside " +
        "contents and file names will be replaced accordingly. You may omit the `--name` or `-n` " +
        "for this specific option. If omitted in an interactive terminal, you will be prompted.",
      isDefault: true,
    })
    .option({
      name: "config",
      aliases: ["c"],
      description: "Filename or directory to load config from",
    })
    .option({
      name: "git",
      aliases: ["g"],
      description: "Git URL or GitHub path to load a template from.",
    })
    .option({
      name: "key",
      aliases: ["k"],
      description:
        "Key to load inside the config file. This overwrites the config key provided after the colon in `--config` " +
        "(e.g. `--config scaffold.cmd.js:component)`. If omitted and multiple templates are available, " +
        "you will be prompted to select one.",
    })
    .option({
      name: "output",
      aliases: ["o"],
      description:
        "Path to output to. If `--subdir` is enabled, the subdir will be created inside " +
        "this path. If omitted in an interactive terminal, you will be prompted.",
    })
    .option({
      name: "templates",
      aliases: ["t"],
      array: true,
      description:
        "Template files to use as input. You may provide multiple files, each of which can be a relative or " +
        "absolute path, " +
        "or a glob pattern for multiple file matching easily. If omitted in an interactive terminal, " +
        "you will be prompted for a comma-separated list.",
    })
    .flag({
      name: "overwrite",
      aliases: ["w"],
      defaultValue: false,
      description: "Enable to override output files, even if they already exist.",
      negatable: true,
    })
    .option({
      name: "data",
      aliases: ["d"],
      description: "Add custom data to the templates. By default, only your app name is included.",
      parse: (v) => JSON.parse(v),
    })
    .option({
      name: "append-data",
      aliases: ["D"],
      description:
        "Append additional custom data to the templates, which will overwrite `--data`, using an alternate syntax, " +
        "which is easier to use with CLI: `-D key1=string -D key2:=raw`",
      parse: parseAppendData,
    })
    .flag({
      name: "subdir",
      aliases: ["s"],
      defaultValue: false,
      description: "Create a parent directory with the input name (and possibly `--subdir-helper`",
      negatable: true,
      negationName: "no-subdir",
    })
    .option({
      name: "subdir-helper",
      aliases: ["H"],
      description: "Default helper to apply to subdir name when using `--subdir`.",
    })
    .flag({
      name: "quiet",
      aliases: ["q"],
      defaultValue: false,
      description: "Suppress output logs (Same as `--log-level none`)",
    })
    .option({
      name: "log-level",
      aliases: ["l"],
      defaultValue: LogLevel.info,
      description:
        "Determine amount of logs to display. The values are: " +
        `${colorize.bold`\`none | debug | info | warn | error\``}. ` +
        "The provided level will display messages of the same level or higher.",
      parse: (v) => {
        const val = v.toLowerCase()
        if (!(val in LogLevel)) {
          throw new Error(
            `Invalid log level: ${val}, must be one of: ${Object.keys(LogLevel).join(", ")}`,
          )
        }
        return val
      },
    })
    .option({
      name: "before-write",
      aliases: ["B"],
      description:
        "Run a script before writing the files. This can be a command or a path to a" +
        " file. A temporary file path will be passed to the given command and the command should " +
        "return a string for the final output.",
    })
    .option({
      name: "after-scaffold",
      aliases: ["A"],
      description:
        "Run a shell command after all files have been written. " +
        "The command is executed in the output directory. " +
        "For example: `--after-scaffold 'npm install'`",
    })
    .flag({
      name: "dry-run",
      aliases: ["dr"],
      defaultValue: false,
      description:
        "Don't emit files. This is good for testing your scaffolds and making sure they " +
        "don't fail, without having to write actual file contents or create directories.",
    })
    .flag({
      name: "version",
      aliases: ["v"],
      description: "Display version.",
    })
    .command(
      new MassargCommand<ListCommandCliOptions>({
        name: "list",
        aliases: ["ls"],
        description:
          "List all available templates for a given config. See `list -h` for more information.",
        run: async (_config) => {
          const config = {
            templates: [],
            name: "",
            version: false,
            output: "",
            subdir: false,
            overwrite: false,
            dryRun: false,
            tmpDir: generateUniqueTmpPath(),
            ..._config,
            config: _config.config ?? (!_config.git ? process.cwd() : undefined),
          }
          try {
            const file = await getConfigFile(config)
            console.log(colorize.underline`Available templates:\n`)
            console.log(Object.keys(file).join("\n"))
          } catch (e) {
            const message = "message" in (e as object) ? (e as Error).message : e?.toString()
            log(config, LogLevel.error, message)
          } finally {
            log(config, LogLevel.debug, "Cleaning up temporary files...", config.tmpDir)
            if (config.tmpDir) await fs.rm(config.tmpDir, { recursive: true, force: true })
          }
        },
      })
        .option({
          name: "config",
          aliases: ["c"],
          description:
            "Filename or directory to load config from. Defaults to current working directory.",
        })
        .option({
          name: "git",
          aliases: ["g"],
          description: "Git URL or GitHub path to load a template from.",
        })
        .option({
          name: "log-level",
          aliases: ["l"],
          defaultValue: LogLevel.none,
          description:
            "Determine amount of logs to display. The values are: " +
            `${colorize.bold`\`none | debug | info | warn | error\``}. ` +
            "The provided level will display messages of the same level or higher.",
          parse: (v) => {
            const val = v.toLowerCase()
            if (!(val in LogLevel)) {
              throw new Error(
                `Invalid log level: ${val}, must be one of: ${Object.keys(LogLevel).join(", ")}`,
              )
            }
            return val
          },
        })
        .help({
          bindOption: true,
        }),
    )
    .command(
      new MassargCommand<{ dir?: string; format?: string }>({
        name: "init",
        aliases: [],
        description:
          "Initialize a new scaffold config file and example template in the current directory.",
        run: async (config) => {
          try {
            await initScaffold({
              dir: config.dir,
              format: config.format as "js" | "mjs" | "json" | undefined,
            })
          } catch (e) {
            const message = "message" in (e as object) ? (e as Error).message : e?.toString()
            console.error(colorize.red(message ?? "Unknown error"))
          }
        },
      })
        .option({
          name: "dir",
          aliases: ["d"],
          description: "Directory to create the config in. Defaults to current working directory.",
        })
        .option({
          name: "format",
          aliases: ["f"],
          description: "Config file format: js, mjs, or json. If omitted, you will be prompted.",
        })
        .help({
          bindOption: true,
        }),
    )
    .example({
      description: "Usage with config file",
      input: "simple-scaffold -c scaffold.cmd.js --key component",
    })
    .example({
      description: "Usage with GitHub config file",
      input: "simple-scaffold -g chenasraf/simple-scaffold --key component",
    })
    .example({
      description: "Usage with https git URL (for non-GitHub)",
      input:
        "simple-scaffold -g https://example.com/user/template.git -c scaffold.cmd.js --key component",
    })
    .example({
      description: "Excluded template key, assumes 'default' key",
      input: "simple-scaffold -c scaffold.cmd.js MyComponent",
    })
    .example({
      description:
        "Shortest syntax for GitHub, searches for config file automaticlly, assumes and template key 'default'",
      input: "simple-scaffold -g chenasraf/simple-scaffold MyComponent",
    })
    .help({
      bindOption: true,
      lineLength: 100,
      useGlobalTableColumns: true,
      usageText: [
        colorize.yellow`simple-scaffold`,
        colorize.gray`[options]`,
        colorize.cyan`<name>`,
      ].join(" "),
      optionOptions: {
        displayNegations: true,
      },
      footerText: [
        `Version:  ${pkg.version}`,
        `Copyright © Chen Asraf 2017-${new Date().getFullYear()}`,
        ``,
        `Documentation:  ${colorize.underline`https://chenasraf.github.io/simple-scaffold`}`,
        `NPM:  ${colorize.underline`https://npmjs.com/package/simple-scaffold`}`,
        `GitHub:  ${colorize.underline`https://github.com/chenasraf/simple-scaffold`}`,
      ].join("\n"),
    })
    .parse(args)
}

parseCliArgs()
