#!/usr/bin/env node
import { massarg } from "massarg"
import chalk from "chalk"
import { LogLevel, ScaffoldCmdConfig } from "./types"
import { Scaffold } from "./scaffold"
import path from "node:path"
import fs from "node:fs/promises"
import { parseAppendData, parseConfigFile } from "./config"

export async function parseCliArgs(args = process.argv.slice(2)) {
  const pkgFile = await fs.readFile(path.join(__dirname, "package.json"))
  const pkg = JSON.parse(pkgFile.toString())
  const isConfigProvided =
    args.includes("--config") || args.includes("-c") || args.includes("--git") || args.includes("-g")

  return (
    massarg<ScaffoldCmdConfig>({
      name: pkg.name,
      description: pkg.description,
    })
      .main(async (config) => {
        const parsed = await parseConfigFile(config)
        return Scaffold(parsed)
      })
      .option({
        name: "name",
        aliases: ["n"],
        description:
          "Name to be passed to the generated files. `{{name}}` and other data parameters inside " +
          "contents and file names will be replaced accordingly. You may omit the `--name` or `-n` for this specific option.",
        isDefault: true,
        required: true,
      })
      .option({
        name: "config",
        aliases: ["c"],
        description:
          "Filename to load config from instead of passing arguments to CLI or using a Node.js " +
          "script. See examples for syntax. This can also work in conjunction with `--git` or `--github` to point " +
          "to remote files, and with `--key` to denote which key to select from the file.",
      })
      .option({
        name: "git",
        aliases: ["g"],
        description:
          "Git URL to load config from instead of passing arguments to CLI or using a Node.js script. See " +
          "examples for syntax.",
      })
      .option({
        name: "key",
        aliases: ["k"],
        description:
          "Key to load inside the config file. This overwrites the config key provided after the colon in `--config` " +
          "(e.g. `--config scaffold.cmd.js:component)`",
      })
      .option({
        name: "output",
        aliases: ["o"],
        description:
          "Path to output to. If `--create-sub-folder` is enabled, the subfolder will be created inside " +
          "this path. Default is current working directory.",
        required: !isConfigProvided,
      })
      .option({
        name: "templates",
        aliases: ["t"],
        array: true,
        description:
          "Template files to use as input. You may provide multiple files, each of which can be a relative or " +
          "absolute path, " +
          "or a glob pattern for multiple file matching easily.",
        required: !isConfigProvided,
      })
      .flag({
        name: "overwrite",
        aliases: ["w"],
        defaultValue: false,
        description: "Enable to override output files, even if they already exist.",
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
        name: "create-sub-folder",
        aliases: ["s"],
        defaultValue: false,
        description: "Create subfolder with the input name",
      })
      .option({
        name: "sub-folder-name-helper",
        aliases: ["sh"],
        description: "Default helper to apply to subfolder name when using `--create-sub-folder true`.",
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
          `${chalk.bold`\`none | debug | info | warn | error\``}. ` +
          "The provided level will display messages of the same level or higher.",
        parse: Number,
      })
      .flag({
        name: "dry-run",
        aliases: ["dr"],
        defaultValue: false,
        description:
          "Don't emit files. This is good for testing your scaffolds and making sure they " +
          "don't fail, without having to write actual file contents or create directories.",
      })
      // .example({
      //   input: `yarn cmd -t examples/test-input/Component -o examples/test-output -d '{"property":"myProp","value":"10"}'`,
      //   description: "Usage",
      //   output: "",
      // })
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
        input: "simple-scaffold -g https://example.com/user/template.git -c scaffold.cmd.js --key component",
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
        // optionOptions: {
        //   displayNegations: true,
        // },
        footerText: [
          `Version:  ${pkg.version}`,
          `Copyright © Chen Asraf 2017-${new Date().getFullYear()}`,
          ``,
          `Documentation:\n  ${chalk.underline`https://chenasraf.github.io/simple-scaffold`}`,
          `NPM:\n  ${chalk.underline`https://npmjs.com/package/simple-scaffold`}`,
          `GitHub:\n  ${chalk.underline`https://github.com/chenasraf/simple-scaffold`}`,
        ].join("\n"),
      })
      .parse(args)
  )
}

parseCliArgs()
