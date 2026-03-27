---
title: Configuration Files
---

# Configuration Files

Config files let you define reusable scaffold definitions — template paths, output directories,
custom data, inputs, and hooks — all in one place.

## Creating a Config File

The fastest way is to run `init`:

```sh
npx simple-scaffold init
```

This creates a `scaffold.config.js` and an example template in `templates/default/`. See
[`init` command](cli#init) for options.

### Config Structure

A config file exports an object mapping **template keys** to scaffold configurations:

```js
// scaffold.config.js
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
  },
  page: {
    templates: ["templates/page"],
    output: "src/pages",
    subdir: true,
  },
}
```

For the full list of options, see [ScaffoldConfig](../api/interfaces/ScaffoldConfig) or the
[Node.js API](node) page.

### Dynamic Configs

JS config files can export a **function** that receives the CLI config and returns the scaffold map.
This lets you pre-process arguments or add logic:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = (config) => ({
  component: {
    templates: ["templates/component"],
    output: "src/components",
    data: { timestamp: Date.now() },
  },
})
```

The function can also be `async`.

### Supported Formats

- `.js` (CommonJS)
- `.cjs` (CommonJS, explicit)
- `.mjs` (ESM)
- `.json`

:::note The correct extension may depend on your `package.json` `"type"` field. Packages with
`"type": "module"` may require `.mjs` or `.cjs` instead of `.js`. :::

## Using a Config File

### Auto-detection

Simple Scaffold automatically searches the current directory for a config file — no `--config` flag
needed. The following names are tried in order:

1. `scaffold.config.{mjs,cjs,js,json}`
2. `scaffold.{mjs,cjs,js,json}`
3. `.scaffold.{mjs,cjs,js,json}`

```sh
# Just run from the project root — config is found automatically
npx simple-scaffold -k component MyComponent
```

### Explicit Path

Use `--config` (`-c`) to point to a specific file or directory:

```sh
npx simple-scaffold -c path/to/scaffold.config.js -k component MyComponent
```

When a directory is given, the auto-detection order above is used within that directory.

### Default Template Key

If you don't provide `--key`, the `default` key is used:

```js
module.exports = {
  default: {
    templates: ["templates/default"],
    output: "src",
  },
}
```

```sh
# Uses the "default" key — no -k needed
npx simple-scaffold MyProject
```

If multiple keys exist and no `--key` is provided, you'll be prompted to select one interactively.

### Providing a Default Name

If your template doesn't need a dynamic name (e.g. common config files), set `name` in the config:

```js
module.exports = {
  eslint: {
    name: ".eslintrc",
    templates: ["templates/eslint"],
    output: ".",
  },
}
```

The name can still be overridden with `--name` on the command line.

## Inputs

Inputs define custom fields that are prompted interactively and become template data variables:

```js
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
    inputs: {
      author: { message: "Author name", required: true },
      license: {
        type: "select",
        message: "License",
        options: ["MIT", "Apache-2.0", "GPL-3.0"],
      },
      private: { type: "confirm", message: "Private?", default: false },
      port: { type: "number", message: "Port", default: 3000 },
    },
  },
}
```

Use them in templates as `{{ author }}`, `{{ license }}`, `{{ private }}`, `{{ port }}`.

**Input types:**

| Type      | Description                    | Value type |
| --------- | ------------------------------ | ---------- |
| `text`    | Free-form text input (default) | `string`   |
| `select`  | Choose from a list of options  | `string`   |
| `confirm` | Yes/no prompt                  | `boolean`  |
| `number`  | Numeric input                  | `number`   |

**Behavior:**

- **Required** inputs are prompted if not provided via `--data` or `-D`
- **Select and confirm** inputs are always prompted unless pre-provided
- **Optional** inputs with a `default` use that value silently
- In non-interactive environments (CI, piped input), only defaults are applied

Pre-fill inputs from the CLI:

```sh
npx simple-scaffold -k component -D author=John -D license=MIT MyComponent
```

## Remote Templates (Git)

Load config files and templates from any Git repository:

```sh
# GitHub shorthand
npx simple-scaffold -g username/repo -k component MyComponent

# Full Git URL (GitLab, Bitbucket, etc.)
npx simple-scaffold -g https://gitlab.com/user/repo.git -k component MyComponent
```

When `--config` is omitted, the standard auto-detection order is used within the cloned repo. The
repository is cloned to a temporary directory and cleaned up automatically.

### From Node.js

```ts
import Scaffold from "simple-scaffold"

const scaffold = await Scaffold.fromConfig(
  "https://github.com/user/repo.git", // or a local file path
  { name: "MyComponent", key: "component" },
)
await scaffold.run()
```
