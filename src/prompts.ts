import input from "@inquirer/input"
import select from "@inquirer/select"
import { colorize } from "./colors"
import { ScaffoldCmdConfig, ScaffoldConfigMap } from "./types"

/** Prompts the user for a scaffold name. */
export async function promptForName(): Promise<string> {
  return input({
    message: colorize.cyan("Scaffold name:"),
    required: true,
    validate: (value) => {
      if (!value.trim()) return "Name cannot be empty"
      return true
    },
  })
}

/** Prompts the user to select a template key from the available config keys. */
export async function promptForTemplateKey(configMap: ScaffoldConfigMap): Promise<string> {
  const keys = Object.keys(configMap)
  if (keys.length === 0) {
    throw new Error("No templates found in config file")
  }
  if (keys.length === 1) {
    return keys[0]
  }
  return select({
    message: colorize.cyan("Select a template:"),
    choices: keys.map((key) => ({
      name: key,
      value: key,
    })),
  })
}

/** Prompts the user for an output directory path. */
export async function promptForOutput(): Promise<string> {
  return input({
    message: colorize.cyan("Output directory:"),
    required: true,
    default: ".",
    validate: (value) => {
      if (!value.trim()) return "Output directory cannot be empty"
      return true
    },
  })
}

/** Prompts the user for template paths (comma-separated). */
export async function promptForTemplates(): Promise<string[]> {
  const value = await input({
    message: colorize.cyan("Template paths (comma-separated):"),
    required: true,
    validate: (value) => {
      if (!value.trim()) return "At least one template path is required"
      return true
    },
  })
  return value.split(",").map((t) => t.trim()).filter(Boolean)
}

/** Returns true if the process is running in an interactive terminal. */
export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY)
}

/**
 * Fills in missing config values by prompting the user interactively.
 * Only prompts when running in a TTY — in non-interactive mode, returns config as-is.
 */
export async function promptForMissingConfig(
  config: ScaffoldCmdConfig,
  configMap?: ScaffoldConfigMap,
): Promise<ScaffoldCmdConfig> {
  if (!isInteractive()) {
    return config
  }

  if (!config.name) {
    config.name = await promptForName()
  }

  if (configMap && !config.key) {
    const keys = Object.keys(configMap)
    if (keys.length > 1) {
      config.key = await promptForTemplateKey(configMap)
    }
  }

  if (!config.output) {
    config.output = await promptForOutput()
  }

  if (!config.templates || config.templates.length === 0) {
    config.templates = await promptForTemplates()
  }

  return config
}
