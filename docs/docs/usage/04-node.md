---
title: Node.js Usage
---

## Overview

You can build the scaffold yourself, if you want to create more complex arguments, scaffold groups,
etc - simply pass a config object to the Scaffold function when you are ready to start.

The config takes similar arguments to the command line. See the full
[API documentation](https://chenasraf.github.io/simple-scaffold/docs/api/interfaces/ScaffoldConfig)
for all configuration options and their behavior.

```ts
interface ScaffoldConfig {
  name: string
  templates: string[]
  output: FileResponse<string>
  subdir?: boolean
  data?: Record<string, unknown>
  overwrite?: FileResponse<boolean>
  logLevel?: LogLevel
  dryRun?: boolean
  helpers?: Record<string, Helper>
  subdirHelper?: DefaultHelpers | string
  inputs?: Record<string, ScaffoldInput>
  beforeWrite?(
    content: Buffer,
    rawContent: Buffer,
    outputPath: string,
  ): string | Buffer | undefined | Promise<string | Buffer | undefined>
  afterScaffold?: AfterScaffoldHook
}

interface ScaffoldInput {
  message?: string
  required?: boolean
  default?: string
}

interface AfterScaffoldContext {
  config: ScaffoldConfig
  files: string[] // absolute paths of written files
}

type AfterScaffoldHook = ((context: AfterScaffoldContext) => void | Promise<void>) | string
```

### Before Write option

This option allows you to preprocess a file before it is being written, such as running a formatter,
linter or other commands.

To use this option, you can run any async/blocking command, and return a string as the final output
to be used as the file contents.

Returning `undefined` will keep the file contents as-is, after normal Handlebars.js procesing by
Simple Scaffold.

### After Scaffold hook

The `afterScaffold` option runs after all files have been written. It receives a context object with
the resolved config and the list of files that were created.

```typescript
import Scaffold from "simple-scaffold"

await Scaffold({
  name: "my-app",
  templates: ["templates/app"],
  output: ".",
  afterScaffold: async ({ config, files }) => {
    console.log(`Created ${files.length} files`)
    // e.g. run npm install, git init, open editor, etc.
  },
})
```

You can also pass a shell command string, which will be executed in the output directory:

```typescript
await Scaffold({
  name: "my-app",
  templates: ["templates/app"],
  output: "my-app",
  afterScaffold: "npm install && git init",
})
```

In dry-run mode, the hook is still called but the `files` array will be empty.

### Inputs

The `inputs` option lets you define fields that will be prompted interactively (when running in a
TTY) and merged into the template data. This is useful when your templates need user-specific
values.

```typescript
import Scaffold from "simple-scaffold"

await Scaffold({
  name: "component",
  templates: ["templates/component"],
  output: "src/components",
  inputs: {
    author: { message: "Author name", required: true },
    license: { message: "License", default: "MIT" },
  },
})
// In templates: {{ author }}, {{ license }}
```

- **Required** inputs are prompted if not already in `data`
- **Optional** inputs with a `default` are applied silently
- Pre-providing values in `data` skips the prompt for that input

## Example

This is an example of loading a complete scaffold via Node.js:

```typescript
import Scaffold from "simple-scaffold"

await Scaffold({
  name: "component",
  templates: [path.join(__dirname, "scaffolds", "component")],
  output: path.join(__dirname, "src", "components"),
  subdir: true,
  subdirHelper: "upperCase",
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
  // return a string to replace the final file contents after pre-processing, or `undefined`
  // to keep it as-is
  beforeWrite: (content, rawContent, outputPath) => content.toString().toUpperCase(),
})
```
