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
[Node.js configuration structure](https://chenasraf.github.io/simple-scaffold/pages/docs/node.md):

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

A `.js` file is just like a `.json` file, make sure to export the final configuration:

```js
/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
  },
}
```

## Using a config file

Once your config is created, you can use it by providing the file name to the `--config` (or `-c`
for brevity), followed by a colon, then your scaffold config name. For example:

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
