If you want to have reusable configurations which are complex and don't fit into command lines
easily, or just want to manage your templates easier, you can use configuration files to load your
scaffolding configurations.

## Creating config files

Configuration files should be valid `.js`/`.json` files that contain valid Scaffold configurations.

Each file hold multiple scaffolds. Each scaffold is a key, and its value is the configuration. For
example:

```json
{
  "component": {
    "templates": ["templates/component"],
    "output": "src/components"
  }
}
```

The configuration contents are identical to the
[Node.js configuration structure](https://chenasraf.github.io/simple-scaffold/pages/node.md):

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

If you want to supply functions inside the configurations, you must use a `.js` file as JSON does
not support non-primitives.

A `.js` file can be just like a `.json` file, make sure to export the final configuration:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
  },
}
```

Another feature of using a JS file is you can export a function which will be loaded with the CMD
config provided to Simple Scaffold. The `extras` key contains any values not consumed by built-in
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

## Using a config file

Once your config is created, you can use it by providing the file name to the `--config` (or `-c`
for brevity), optionally followed by a colon, then your scaffold config name.

```shell
simple-scaffold -c <file>[:<template_key>]
```

For example:

```shell
simple-scaffold -c scaffold.json:component MyComponentName
```

If you don't want to supply a template/config name (e.g. `component`), you can omit the colon and
the name, and it will use the configuration named `default`:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  default: {
    // ...
  },
}
```

And then:

```shell
# will use 'default' template
simple-scaffold -c scaffold.json MyComponentName
```

## Remote Templates

You can load template groups remotely, similar to how you would pass a config normally.

The main difference is the templates will be hosted on a remote location such as a git server, and
not locally in your project. This can be done to easily share & reuse templates.

When passing a git URL to `--config`, you will clone that repo and use the files there as template.

The syntax is as follows:

```shell
simple-scaffold -c <git_url>[#<git_file>][:<template_key>]
```

For example, to use this repository's example as base:

```shell
simple-scaffold -c https://github.com/chenasraf/simple-scaffold.git#scaffold.config.js:component
```

When the `filename` is omitted, `/scaffold.config.js` will be used as default.

When the `template_key` is ommitted, `default` will be used as default.

### GitHub Templates

As a shorter alternative to the above example, you can use `--github` or `-gh` to reference a GitHub
URL without specifying the whole path.

The syntax is as follows:

```shell
simple-scaffold -gh <username>/<project_name>[#<git_file>][:<template_key>]
```

This example is equivalent to the above, just shorter to write:

```shell
simple-scaffold -c chenasraf/simple-scaffold#scaffold.config.js:component
```

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
