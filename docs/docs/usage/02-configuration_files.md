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

For the full configuration options, see [ScaffoldConfigFile](../api/modules#scaffoldconfigfile).

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

If you want to provide templates that need no name (such as common config files which are easily
portable between projects), you may provide the `name` property in the config object.

You will always be able to override it using `--name NewName`, but it will be given a value by
default and therefore it will no longer be required in the CLI arguments.

## Using a config file

Once your config is created, you can use it by providing the file name to the `--config` (or `-c`
for brevity), optionally alongside `--key` or `-k`, denoting the key to use as the config object, as
you define in your config:

```sh
simple-scaffold -c <file> -k <template_key>
```

For example:

```sh
simple-scaffold -c scaffold.json -k component MyComponentName
```

If you don't want to supply a template/config name (e.g. `component`), `default` will be used:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  default: {
    // ...
  },
}
```

And then:

```sh
# will use 'default' template
simple-scaffold -c scaffold.json MyComponentName
```

- When the a directory is given, the following files in the given directory will be tried in order:

  - `scaffold.config.*`
  - `scaffold.*`

  Where `*` denotes any supported file extension, in the priority listed in
  [Supported file types](#supported-file-types)

- When the `template_key` is ommitted, `default` will be used as default.

### Supported file types

Any importable file is supported, depending on your build process.

Common files include:

- `*.mjs`
- `*.cjs`
- `*.js`
- `*.json`

When filenames are ommited when loading configs, these are the file extensions that will be
automatically tried, by the specified order of priority.

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
