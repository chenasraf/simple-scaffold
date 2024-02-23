---
title: Node.js Usage
---

## Overview

You can build the scaffold yourself, if you want to create more complex arguments, scaffold groups,
etc - simply pass a config object to the Scaffold function when you are ready to start.

The config takes similar arguments to the command line. The full type definitions can be found in
[src/types.ts](https://github.com/chenasraf/simple-scaffold/blob/develop/src/types.ts#L13).

See the full
[documentation](https://chenasraf.github.io/simple-scaffold/interfaces/ScaffoldConfig.html) for the
configuration options and their behavior.

```ts
interface ScaffoldConfig {
  name: string
  templates: string[]
  output: FileResponse<string>
  createSubFolder?: boolean
  data?: Record<string, any>
  overwrite?: FileResponse<boolean>
  quiet?: boolean
  verbose?: LogLevel
  dryRun?: boolean
  helpers?: Record<string, Helper>
  subFolderNameHelper?: DefaultHelpers | string
  beforeWrite?(
    content: Buffer,
    rawContent: Buffer,
    outputPath: string,
  ): string | Buffer | undefined | Promise<string | Buffer | undefined>
}
```

### Before Write option

This option allows you to preprocess a file before it is being written, such as running a formatter,
linter or other commands.

To use this option, you can run any async/blocking command, and return a string as the final output
to be used as the file contents.

Returning `undefined` will keep the file contents as-is, after normal Handlebars.js procesing by
Simple Scaffold.

## Example

This is an example of loading a complete scaffold via Node.js:

```typescript
import Scaffold from "simple-scaffold"

const config = {
  name: "component",
  templates: [path.join(__dirname, "scaffolds", "component")],
  output: path.join(__dirname, "src", "components"),
  createSubFolder: true,
  subFolderNameHelper: "upperCase"
  data: {
    property: "value",
  },
  helpers: {
    twice: (text) => [text, text].join(" ")
  },
  // return a string to replace the final file contents after pre-processing, or `undefined`
  // to keep it as-is
  beforeWrite: (content, rawContent, outputPath) => content.toString().toUpperCase()
}

const scaffold = Scaffold(config)
```
