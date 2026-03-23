import path from "node:path"
import fs from "node:fs/promises"
import select from "@inquirer/select"
import { colorize } from "./colors"
import { pathExists } from "./fs-utils"

const CONFIG_EXTENSIONS = {
  js: "scaffold.config.js",
  mjs: "scaffold.config.mjs",
  json: "scaffold.config.json",
} as const

type ConfigFormat = keyof typeof CONFIG_EXTENSIONS

const CONFIG_TEMPLATES: Record<ConfigFormat, string> = {
  js: `/** @type {import('simple-scaffold').ScaffoldConfigMap} */
module.exports = {
  default: {
    templates: ["templates/default"],
    output: ".",
    // inputs: {
    //   author: { message: "Author name", required: true },
    //   license: { message: "License", default: "MIT" },
    // },
  },
}
`,
  mjs: `/** @type {import('simple-scaffold').ScaffoldConfigMap} */
export default {
  default: {
    templates: ["templates/default"],
    output: ".",
    // inputs: {
    //   author: { message: "Author name", required: true },
    //   license: { message: "License", default: "MIT" },
    // },
  },
}
`,
  json: `{
  "default": {
    "templates": ["templates/default"],
    "output": "."
  }
}
`,
}

const EXAMPLE_TEMPLATE_CONTENT = `# {{ name }}

Created by Simple Scaffold.

{{#if description}}{{ description }}{{/if}}
`

export interface InitOptions {
  /** Working directory to create the config in. Defaults to cwd. */
  dir?: string
  /** Config format to use. If not provided, the user is prompted. */
  format?: ConfigFormat
  /** Whether to create an example template directory. Defaults to true. */
  createExample?: boolean
}

/**
 * Initializes a new Simple Scaffold project by creating a config file
 * and an optional example template directory.
 */
export async function initScaffold(options: InitOptions = {}): Promise<void> {
  const dir = options.dir ?? process.cwd()

  const format =
    options.format ??
    (await select<ConfigFormat>({
      message: colorize.cyan("Config file format:"),
      choices: [
        { name: "JavaScript (CommonJS)", value: "js" },
        { name: "JavaScript (ESM)", value: "mjs" },
        { name: "JSON", value: "json" },
      ],
    }))

  const filename = CONFIG_EXTENSIONS[format]
  const configPath = path.resolve(dir, filename)

  if (await pathExists(configPath)) {
    console.log(colorize.yellow(`${filename} already exists, skipping config creation.`))
  } else {
    await fs.writeFile(configPath, CONFIG_TEMPLATES[format])
    console.log(colorize.green(`Created ${filename}`))
  }

  const createExample = options.createExample ?? true
  if (createExample) {
    const templateDir = path.resolve(dir, "templates", "default")
    const templateFile = path.join(templateDir, "{{name}}.md")

    if (await pathExists(templateDir)) {
      console.log(colorize.yellow("templates/default/ already exists, skipping example template."))
    } else {
      await fs.mkdir(templateDir, { recursive: true })
      await fs.writeFile(templateFile, EXAMPLE_TEMPLATE_CONTENT)
      console.log(colorize.green("Created templates/default/{{name}}.md"))
    }
  }

  console.log()
  console.log(colorize.dim("Get started:"))
  console.log(colorize.dim(`  npx simple-scaffold MyProject`))
  console.log()
}
