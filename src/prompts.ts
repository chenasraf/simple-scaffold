import input from "@inquirer/input"
import select from "@inquirer/select"
import confirm from "@inquirer/confirm"
import number from "@inquirer/number"
import { colorize } from "./colors"
import {
  ScaffoldCmdConfig,
  ScaffoldConfig,
  ScaffoldConfigMap,
  ScaffoldInput,
  ScaffoldInputType,
} from "./types"

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
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Prompts for a single input based on its type. */
async function promptSingleInput(
  key: string,
  def: ScaffoldInput,
): Promise<string | boolean | number | undefined> {
  const type: ScaffoldInputType = def.type ?? "text"
  const message = colorize.cyan(def.message ?? `${key}:`)

  switch (type) {
    case "text":
      return input({
        message,
        required: def.required,
        default: def.default as string | undefined,
        validate: def.required
          ? (value) => {
              if (!value.trim()) return `${key} is required`
              return true
            }
          : undefined,
      })

    case "select": {
      const choices = (def.options ?? []).map((opt) =>
        typeof opt === "string" ? { name: opt, value: opt } : opt,
      )
      if (choices.length === 0) {
        throw new Error(`Input "${key}" has type "select" but no options defined`)
      }
      return select({
        message,
        choices,
        default: def.default as string | undefined,
      })
    }

    case "confirm":
      return confirm({
        message,
        default: (def.default as boolean | undefined) ?? false,
      })

    case "number":
      return (
        (await number({
          message,
          required: def.required,
          default: def.default as number | undefined,
        })) ?? def.default
      )
  }
}

/**
 * Prompts the user for any required scaffold inputs that are not already provided in data.
 * Also applies default values for optional inputs that have one.
 * Returns the merged data object.
 */
export async function promptForInputs(
  inputs: Record<string, ScaffoldInput>,
  existingData: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const data = { ...existingData }

  for (const [key, def] of Object.entries(inputs)) {
    // Skip if already provided via data/CLI
    if (key in data && data[key] !== undefined && data[key] !== "") {
      continue
    }

    if (def.required || def.type === "select" || def.type === "confirm") {
      data[key] = await promptSingleInput(key, def)
    } else if (def.default !== undefined && !(key in data)) {
      data[key] = def.default
    }
  }

  return data
}

/** Returns true if the process is running in an interactive terminal. */
export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY)
}

/**
 * Prompts for name and template key before the config file is parsed.
 * These are needed by parseConfigFile to know which template to load.
 */
export async function promptBeforeConfig(
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

  return config
}

/**
 * Prompts for any values still missing after the config file has been parsed.
 * Only prompts in interactive mode.
 */
export async function promptAfterConfig(config: ScaffoldConfig): Promise<ScaffoldConfig> {
  if (!isInteractive()) {
    return config
  }

  if (!config.output || (typeof config.output === "string" && !config.output)) {
    config.output = await promptForOutput()
  }

  if (!config.templates || config.templates.length === 0) {
    config.templates = await promptForTemplates()
  }

  return config
}

/**
 * @deprecated Use {@link promptBeforeConfig} and {@link promptAfterConfig} instead.
 */
export async function promptForMissingConfig(
  config: ScaffoldCmdConfig,
  configMap?: ScaffoldConfigMap,
): Promise<ScaffoldCmdConfig> {
  const afterPre = await promptBeforeConfig(config, configMap)

  if (!isInteractive()) {
    return afterPre
  }

  if (!afterPre.output) {
    afterPre.output = await promptForOutput()
  }

  if (!afterPre.templates || afterPre.templates.length === 0) {
    afterPre.templates = await promptForTemplates()
  }

  return afterPre
}

/**
 * Prompts for any required inputs defined in the scaffold config and merges them into data.
 * Only prompts in interactive mode; in non-interactive mode, only applies defaults.
 */
export async function resolveInputs(config: ScaffoldConfig): Promise<ScaffoldConfig> {
  if (!config.inputs) {
    return config
  }

  const interactive = isInteractive()

  if (interactive) {
    config.data = await promptForInputs(config.inputs, config.data)
  } else {
    // Non-interactive: only apply defaults
    const data = { ...config.data }
    for (const [key, def] of Object.entries(config.inputs)) {
      if (def.default !== undefined && !(key in data)) {
        data[key] = def.default
      }
    }
    config.data = data
  }

  return config
}
