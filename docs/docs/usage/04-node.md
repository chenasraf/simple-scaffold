---
title: Node.js API
---

# Node.js API

Use Simple Scaffold programmatically for more complex workflows, custom logic, or integration into
build tools.

## Basic Usage

```typescript
import Scaffold from "simple-scaffold"

const scaffold = new Scaffold({
  name: "MyComponent",
  templates: ["templates/component"],
  output: "src/components",
})
await scaffold.run()
```

## Loading from a Config File

```typescript
import Scaffold from "simple-scaffold"

const scaffold = await Scaffold.fromConfig(
  "scaffold.config.js", // local path or HTTPS Git URL
  { name: "MyComponent", key: "component" },
  {
    /* optional config overrides */
  },
)
await scaffold.run()
```

## Config Interface

```typescript
interface ScaffoldConfig {
  name: string
  templates: string[]
  output: FileResponse<string>
  subdir?: boolean
  subdirHelper?: string
  data?: Record<string, unknown>
  overwrite?: FileResponse<boolean>
  logLevel?: "none" | "debug" | "info" | "warn" | "error"
  dryRun?: boolean
  helpers?: Record<string, Helper>
  inputs?: Record<string, ScaffoldInput>
  beforeWrite?(
    content: Buffer,
    rawContent: Buffer,
    outputPath: string,
  ): string | Buffer | undefined | Promise<string | Buffer | undefined>
  afterScaffold?: AfterScaffoldHook
}
```

For the full API reference, see [ScaffoldConfig](../api/interfaces/ScaffoldConfig).

### Options

| Option          | Type                            | Description                                                              |
| --------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `name`          | `string`                        | Name for generated files _(required)_                                    |
| `templates`     | `string[]`                      | Template paths or globs; prefix with `!` to exclude _(required)_         |
| `output`        | `string \| Function`            | Output directory, or a function for per-file control                     |
| `data`          | `Record<string, unknown>`       | Custom data available in templates                                       |
| `inputs`        | `Record<string, ScaffoldInput>` | Interactive input definitions (see [Inputs](configuration_files#inputs)) |
| `helpers`       | `Record<string, Function>`      | Custom Handlebars helpers                                                |
| `subdir`        | `boolean`                       | Create a parent directory with the input name (default: `false`)         |
| `subdirHelper`  | `string`                        | Helper to transform the subdir name (e.g. `"pascalCase"`)                |
| `overwrite`     | `boolean \| Function`           | Overwrite existing files (default: `false`); function for per-file logic |
| `dryRun`        | `boolean`                       | Preview without writing files (default: `false`)                         |
| `logLevel`      | `string`                        | Log verbosity (default: `"info"`)                                        |
| `beforeWrite`   | `Function`                      | Async hook before each file is written                                   |
| `afterScaffold` | `Function \| string`            | Hook after all files are written                                         |

## Hooks

### Before Write

Runs before each file is written. Return a `string` or `Buffer` to replace the file contents, or
`undefined` to keep the default (Handlebars-processed) output.

```typescript
await new Scaffold({
  name: "MyComponent",
  templates: ["templates/component"],
  output: "src/components",
  beforeWrite: async (content, rawContent, outputPath) => {
    // Format the output, transform it, or return undefined to keep as-is
    return content.toString().trim()
  },
}).run()
```

### After Scaffold Hook

Runs after all files have been written. Pass a **function** for full control, or a **string** to run
a shell command in the output directory.

**Function:**

```typescript
await new Scaffold({
  name: "my-app",
  templates: ["templates/app"],
  output: ".",
  afterScaffold: async ({ config, files }) => {
    console.log(`Created ${files.length} files`)
    // e.g. run npm install, git init, open editor, etc.
  },
}).run()
```

**Shell command:**

```typescript
await new Scaffold({
  name: "my-app",
  templates: ["templates/app"],
  output: "my-app",
  afterScaffold: "npm install && git init",
}).run()
```

The context object:

```typescript
interface AfterScaffoldContext {
  config: ScaffoldConfig
  files: string[] // absolute paths of written files
}
```

In dry-run mode, the hook is still called but the `files` array will be empty.

## Inputs

Define interactive prompts that merge into template data:

```typescript
await new Scaffold({
  name: "component",
  templates: ["templates/component"],
  output: "src/components",
  inputs: {
    author: { message: "Author name", required: true },
    license: {
      type: "select",
      message: "License",
      options: ["MIT", "Apache-2.0", "GPL-3.0"],
    },
    private: { type: "confirm", message: "Private package?", default: false },
    port: { type: "number", message: "Dev server port", default: 3000 },
  },
}).run()
// In templates: {{ author }}, {{ license }}, {{ private }}, {{ port }}
```

```typescript
interface ScaffoldInput {
  type?: "text" | "select" | "confirm" | "number"
  message?: string
  required?: boolean
  default?: string | boolean | number
  options?: (string | { name: string; value: string })[] // for type: "select"
}
```

- **Required** inputs are prompted if not already in `data`
- **Optional** inputs with a `default` are applied silently
- Pre-providing values in `data` skips the prompt for that input

## Full Example

```typescript
import path from "path"
import Scaffold from "simple-scaffold"

await new Scaffold({
  name: "MyComponent",
  templates: [path.join(__dirname, "scaffolds", "component")],
  output: path.join(__dirname, "src", "components"),
  subdir: true,
  subdirHelper: "pascalCase",
  data: {
    property: "value",
  },
  helpers: {
    twice: (text) => [text, text].join(" "),
  },
  inputs: {
    author: { message: "Author name", required: true },
    license: { message: "License", default: "MIT" },
  },
  beforeWrite: (content, rawContent, outputPath) => {
    return content.toString().toUpperCase()
  },
  afterScaffold: async ({ config, files }) => {
    console.log(`Created ${files.length} files in ${config.output}`)
  },
}).run()
```
