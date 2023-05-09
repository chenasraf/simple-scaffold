#!/usr/bin/env node
import massarg from "massarg"
import chalk from "chalk"
import { LogLevel, ScaffoldCmdConfig } from "./types"
import { Scaffold } from "./scaffold"
import path from "path"
import fs from "fs/promises"
import { parseAppendData, parseConfig } from "./config"

export async function parseCliArgs(args = process.argv.slice(2)) {
  const pkg = JSON.parse((await fs.readFile(path.join(__dirname, "package.json"))).toString())
  const isConfig = args.includes("--config") || args.includes("-c") || args.includes("--github") || args.includes("-gh")

  return (
    massarg<ScaffoldCmdConfig>()
      .main(async (config) => {
        const _config = await parseConfig(config)
        return Scaffold(_config)
      })
      .option({
        name: "name",
        aliases: ["n"],
        description:
          "Name to be passed to the generated files. {{name}} and {{Name}} inside contents and file names will be replaced accordingly.",
        isDefault: true,
        required: true,
      })
      .option({
        name: "config",
        aliases: ["c"],
        description:
          "Filename or https git URL to load config from instead of passing arguments to CLI or using a Node.js script. See examples for syntax.",
      })
      .option({
        name: "github",
        aliases: ["gh"],
        description:
          "GitHub path to load config from instead of passing arguments to CLI or using a Node.js script. See examples for syntax.",
      })
      .option({
        name: "key",
        aliases: ["k"],
        description:
          "Key to load inside the config file. This overwrites the config key provided after the colon in --config (e.g. --config scaffold.cmd.js:component)",
      })
      .option({
        name: "output",
        aliases: ["o"],
        description: `Path to output to. If --create-sub-folder is enabled, the subfolder will be created inside this path. ${chalk.reset`${chalk.white`(default: current dir)`}`}`,
        required: !isConfig,
      })
      .option({
        name: "templates",
        aliases: ["t"],
        array: true,
        description:
          "Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, " +
          "or a glob pattern for multiple file matching easily.",
        required: !isConfig,
      })
      .option({
        name: "overwrite",
        aliases: ["w"],
        boolean: true,
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
          "Append additional custom data to the templates, which will overwrite --data, using an alternate syntax, which is easier to use with CLI: -D key1=string -D key2:=raw",
        parse: parseAppendData,
      })
      .option({
        name: "create-sub-folder",
        aliases: ["s"],
        boolean: true,
        defaultValue: false,
        description: "Create subfolder with the input name",
      })
      .option({
        name: "sub-folder-name-helper",
        aliases: ["sh"],
        description: "Default helper to apply to subfolder name when using `--create-sub-folder true`.",
      })
      .option({
        name: "quiet",
        aliases: ["q"],
        boolean: true,
        defaultValue: false,
        description: "Suppress output logs (Same as --verbose 0)",
      })
      .option({
        name: "verbose",
        aliases: ["v"],
        defaultValue: LogLevel.Info,
        description:
          "Determine amount of logs to display. The values are: " +
          `${chalk.bold`0 (none) | 1 (debug) | 2 (info) | 3 (warn) | 4 (error)`}. ` +
          "The provided level will display messages of the same level or higher.",
        parse: Number,
      })
      .option({
        name: "dry-run",
        aliases: ["dr"],
        boolean: true,
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
        input: "simple-scaffold -gh chenasraf/simple-scaffold --key component",
      })
      .example({
        description: "Usage with https git URL (for non-GitHub)",
        input: "simple-scaffold -c https://example.com/user/template.git#scaffold.cmd.js --key component",
      })
      .example({
        description: "Full syntax with config path and template key (applicable to all above methods)",
        input: "simple-scaffold -c scaffold.cmd.js:component MyComponent",
      })
      .example({
        description: "Excluded template key, assumes 'default' key",
        input: "simple-scaffold -c scaffold.cmd.js MyComponent",
      })
      .example({
        description: "Shortest syntax for GitHub, assumes file 'scaffold.cmd.js' and template key 'default'",
        input: "simple-scaffold -gh chenasraf/simple-scaffold MyComponent",
      })
      .help({
        binName: "simple-scaffold",
        useGlobalColumns: true,
        usageExample: "[options]",
        printWidth: 100,
        header: [`Create structured files based on templates.`].join("\n"),
        footer: [
          `Version:  ${pkg.version}`,
          `Copyright © Chen Asraf 2017-${new Date().getFullYear()}`,
          ``,
          `Documentation: ${chalk.underline`https://chenasraf.github.io/simple-scaffold`}`,
          `NPM: ${chalk.underline`https://npmjs.com/package/simple-scaffold`}`,
          `GitHub: ${chalk.underline`https://github.com/chenasraf/simple-scaffold`}`,
        ].join("\n"),
      })
      .parse(args)
  )
}

parseCliArgs()
