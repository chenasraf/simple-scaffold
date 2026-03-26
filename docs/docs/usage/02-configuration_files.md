---
title: Configuration Files
---

If you want to have reusable configurations which are complex and don't fit into command lines
easily, or just want to manage your templates easier, you can use configuration files to load your
scaffolding configurations.

## Creating config files

Configuration files should be valid `.js`/`.mjs`/`.cjs`/`.json` files that contain valid Scaffold
configurations.

Each file hold multiple scaffolds. Each scaffold is a key, and its value is the configuration. For
example:

```js
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
  },
}
```

For the full configuration options, see [ScaffoldConfig](../api/interfaces/ScaffoldConfig).

If you want to supply functions inside the configurations, you must use a `.js`/`.cjs`/`.mjs` file
as JSON does not support non-primitives.

Another feature of using a JS file is you can export a function which will be loaded with the CMD
config provided to Simple Scaffold. The `extra` key contains any values not consumed by built-in
flags, so you can pre-process your args before outputting a config:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = (config) => {
  console.log("Config:", config)
  return {
    component: {
      templates: ["templates/component"],
      output: "src/components",
    },
  }
}
```

### Template Inputs

You can define **inputs** in your config to prompt users for custom values when scaffolding. Each
input becomes a template data variable:

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

In your templates, use these as `{{ author }}`, `{{ license }}`, `{{ private }}`, `{{ port }}`.

Supported input types: `text` (default), `select`, `confirm`, `number`. See
[Template Inputs](cli#template-inputs) for the full reference.

- **Required** inputs are prompted interactively if not provided via `--data` or `-D`
- **Select and confirm** inputs are always prompted unless pre-provided
- **Optional** inputs with a `default` use that value silently if not provided
- In non-interactive environments, only defaults are applied

If you want to provide templates that need no name (such as common config files which are easily
portable between projects), you may provide the `name` property in the config object.

You will always be able to override it using `--name NewName`, but it will be given a value by
default and therefore it will no longer be required in the CLI arguments.

## Using a config file

### Auto-detection

By default, Simple Scaffold automatically searches the current working directory for a config file.
No `--config` flag is needed if your config file uses one of the standard names.

The following files are tried in order:

1. `scaffold.config.mjs`
2. `scaffold.config.cjs`
3. `scaffold.config.js`
4. `scaffold.config.json`
5. `scaffold.mjs`
6. `scaffold.cjs`
7. `scaffold.js`
8. `scaffold.json`
9. `.scaffold.mjs`
10. `.scaffold.cjs`
11. `.scaffold.js`
12. `.scaffold.json`

If a config file is found, it is loaded automatically. If multiple templates are defined and no
`--key` is provided, you'll be prompted to select one interactively.

```sh
# Just run from a directory containing scaffold.config.js — no flags needed
simple-scaffold MyComponentName
```

### Explicit config path

You can also provide a specific file or directory path using `--config` (or `-c`), optionally
alongside `--key` or `-k`:

```sh
simple-scaffold -c <file> -k <template_key>
```

For example:

```sh
simple-scaffold -c scaffold.json -k component MyComponentName
```

When a directory is given, the same auto-detection order listed above is used to find a config file
within that directory.

### Default template key

If you don't supply a template key (e.g. `component`), `default` will be used:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  default: {
    // ...
  },
}
```

```sh
# will use 'default' template
simple-scaffold -c scaffold.json MyComponentName
```

If multiple keys exist and no key is specified, you'll be prompted to choose one interactively.

### Supported file types

Any importable file is supported, depending on your build process.

Common extensions:

- `.mjs`
- `.cjs`
- `.js`
- `.json`

Note that you might need to find the correct extension of `.js`, `.cjs` or `.mjs` depending on your
build process and your package type (for example, packages with `"type": "module"` in their
`package.json` might be required to use `.mjs`.)

### Git/GitHub Templates

You may specify a git or GitHub url to use remote templates.

The command line option is `--git` or `-g`.

- You may specify a full git or HTTPS git URL, which will be tried
- You may specify a git username and project if the project is on GitHub

```sh
# GitHub shorthand
simple-scaffold -g <username>/<project_name> [-c <filename>] [-k <template_key>]

# Any git URL, git:// and https:// are supported
simple-scaffold -g git://gitlab.com/<username>/<project_name> [-c <filename>] [-k <template_key>]
simple-scaffold -g https://gitlab.com/<username>/<project_name>.git [-c <filename>] [-k <template_key>]
```

When a config file path is omitted, the files given in the list above will be tried on the root
directory of the git repository.

**Note:** The repository will be cloned to a temporary directory and removed after the scaffolding
has been done.

## Use In Node.js

You can also start a scaffold from Node.js with a remote file or URL config.

Just use the `Scaffold.fromConfig` function:

```ts
Scaffold.fromConfig(
  "scaffold.config.js", // file or HTTPS git URL
  {
    // name of the generated component
    name: "My Component",
    // key to load from the config
    key: "component",
  },
  {
    // other config overrides
  },
)
```
