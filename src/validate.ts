import { z } from "zod/v4"
import { pathExists } from "./fs-utils"

// --- Reusable schemas ---

/** Schema for a JavaScript function value. */
const functionSchema = z
  .any()
  .refine((v) => typeof v === "function", { message: "Expected a function" })

/** Schema for a value that can be either a string or a function. */
const stringOrFunctionSchema = z.union([z.string(), functionSchema])

/** Schema for a value that can be either a boolean or a function. */
const booleanOrFunctionSchema = z.union([z.boolean(), functionSchema])

/** Schema for a select input option — either a plain string or a `{ name, value }` object. */
const selectOptionSchema = z.union([z.string(), z.object({ name: z.string(), value: z.string() })])

/** Schema for the input type enum. */
const inputTypeSchema = z.enum(["text", "select", "confirm", "number"])

/** Schema for the log level enum. */
const logLevelSchema = z.enum(["none", "debug", "info", "warning", "error"])

// --- Input schema ---

/** Zod schema for a single scaffold input definition. */
const scaffoldInputSchema = z.object({
  type: inputTypeSchema.optional(),
  message: z.string().optional(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.boolean(), z.number()]).optional(),
  options: z.array(selectOptionSchema).optional(),
})

type InputDef = z.infer<typeof scaffoldInputSchema>

function validateInputSemantics(
  key: string,
  input: InputDef,
): { path: (string | number)[]; message: string }[] {
  const issues: { path: (string | number)[]; message: string }[] = []
  if (input.type === "select" && (!input.options || input.options.length === 0)) {
    issues.push({
      path: ["inputs", key, "options"],
      message: "select input must have a non-empty options array",
    })
  }
  if (
    input.type === "confirm" &&
    input.default !== undefined &&
    typeof input.default !== "boolean"
  ) {
    issues.push({
      path: ["inputs", key, "default"],
      message: "confirm input default must be a boolean",
    })
  }
  if (input.type === "number" && input.default !== undefined && typeof input.default !== "number") {
    issues.push({
      path: ["inputs", key, "default"],
      message: "number input default must be a number",
    })
  }
  return issues
}

// --- Config schema ---

/** Zod schema for ScaffoldConfig. */
const scaffoldConfigSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    templates: z.array(z.string()).min(1, "templates must contain at least one entry"),
    output: stringOrFunctionSchema,
    subdir: z.boolean().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    overwrite: booleanOrFunctionSchema.optional(),
    logLevel: logLevelSchema.optional(),
    dryRun: z.boolean().optional(),
    helpers: z.record(z.string(), functionSchema).optional(),
    subdirHelper: z.string().optional(),
    inputs: z.record(z.string(), scaffoldInputSchema).optional(),
    beforeWrite: functionSchema.optional(),
    afterScaffold: stringOrFunctionSchema.optional(),
    tmpDir: z.string().optional(),
  })
  .check((ctx) => {
    const config = ctx.value

    if (config.subdirHelper && !config.subdir) {
      ctx.issues.push({
        code: "custom",
        message: "subdirHelper is set but subdir is not enabled",
        path: ["subdirHelper"],
        input: config,
      })
    }

    if (config.inputs) {
      for (const [key, val] of Object.entries(config.inputs)) {
        for (const issue of validateInputSemantics(key, val)) {
          ctx.issues.push({ code: "custom", ...issue, input: config })
        }
      }
    }
  })

export {
  scaffoldConfigSchema,
  scaffoldInputSchema,
  functionSchema,
  stringOrFunctionSchema,
  booleanOrFunctionSchema,
  selectOptionSchema,
  inputTypeSchema,
  logLevelSchema,
}

/**
 * Validates a scaffold config and returns a list of human-readable errors.
 * Returns an empty array if the config is valid.
 */
export function validateConfig(config: unknown): string[] {
  const result = scaffoldConfigSchema.safeParse(config)
  if (result.success) {
    return []
  }
  return result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)"
    return `${path}: ${issue.message}`
  })
}

/**
 * Validates template paths exist on disk.
 * Only checks non-glob, non-negation paths.
 */
export async function validateTemplatePaths(templates: string[]): Promise<string[]> {
  const errors: string[] = []
  for (const tpl of templates) {
    if (tpl.startsWith("!") || tpl.includes("*")) continue
    if (!(await pathExists(tpl))) {
      errors.push(`templates: path does not exist: ${tpl}`)
    }
  }
  return errors
}

/**
 * Validates the config and throws a formatted error if any issues are found.
 * Checks both schema validity and template path existence.
 */
export async function assertConfigValid(config: unknown): Promise<void> {
  const schemaErrors = validateConfig(config)

  const pathErrors =
    config &&
    typeof config === "object" &&
    "templates" in config &&
    Array.isArray((config as { templates: unknown }).templates)
      ? await validateTemplatePaths((config as { templates: string[] }).templates)
      : []

  const allErrors = [...schemaErrors, ...pathErrors]
  if (allErrors.length > 0) {
    const lines = allErrors.map((e) => `  - ${e}`)
    throw new Error(`Invalid scaffold config:\n${lines.join("\n")}`)
  }
}
