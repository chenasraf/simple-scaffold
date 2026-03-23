---
title: CLI Usage
---

## Available flags

```text
Usage: simple-scaffold [options]
```

To see this and more information anytime, add the `-h` or `--help` flag to your call, e.g.
`npx simple-scaffold@latest -h`.

Options:

| Option/flag \| Alias                              | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name` \| `-n`                                  | Name to be passed to the generated files. `{{name}}` and other data parameters inside contents and file names will be replaced accordingly. If omitted in an interactive terminal, you will be prompted.                                                       |
| `--config` \| `-c`                                | Filename or directory to load config from. If omitted, the current directory is searched automatically for a config file (see [Auto-detection](configuration_files#auto-detection)).                                                                           |
| `--git` \| `-g`                                   | Git URL or GitHub path to load a template from.                                                                                                                                                                                                                |
| `--key` \| `-k`                                   | Key to load inside the config file. If omitted and multiple templates are available, you will be prompted to select one.                                                                                                                                       |
| `--output` \| `-o`                                | Path to output to. If `--subdir` is enabled, the subdir will be created inside this path. If omitted in an interactive terminal, you will be prompted.                                                                                                         |
| `--templates` \| `-t`                             | Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, or a glob pattern for multiple file matching easily. If omitted in an interactive terminal, you will be prompted for a comma-separated list. |
| `--overwrite` \| `-w` \| `--no-overwrite` \| `-W` | Enable to override output files, even if they already exist. (default: false)                                                                                                                                                                                  |
| `--data` \| `-d`                                  | Add custom data to the templates. By default, only your app name is included.                                                                                                                                                                                  |
| `--append-data` \| `-D`                           | Append additional custom data to the templates, which will overwrite `--data`, using an alternate syntax, which is easier to use with CLI: `-D key1=string -D key2:=raw`                                                                                       |
| `--subdir` \| `-s` \| `--no-subdir` \| `-S`       | Create a parent directory with the input name (and possibly `--subdir-helper` (default: false)                                                                                                                                                                 |
| `--subdir-helper` \| `-H`                         | Default helper to apply to subdir name when using `--subdir`.                                                                                                                                                                                                  |
| `--quiet` \| `-q`                                 | Suppress output logs (Same as `--log-level none`)(default: false)                                                                                                                                                                                              |
| `--log-level` \| `-l`                             | Determine amount of logs to display. The values are: `none, debug, info, warn, error`. The provided level will display messages of the same level or higher. (default: info)                                                                                   |
| `--before-write` \| `-B`                          | Run a script before writing the files. This can be a command or a path to a file. A temporary file path will be passed to the given command and the command should return a string for the final output.                                                       |
| `--after-scaffold` \| `-A`                        | Run a shell command after all files have been written. The command is executed in the output directory (e.g. `--after-scaffold 'npm install'`).                                                                                                                |
| `--dry-run` \| `-dr`                              | Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write actual file contents or create directories. (default: false)                                                                                |
| `--version` \| `-v`                               | Display version.                                                                                                                                                                                                                                               |

### Interactive Mode

When running in a terminal (TTY), Simple Scaffold will prompt for any missing required values:

- **Name** — text input if `--name` is not provided
- **Template key** — selectable list if `--key` is not provided and the config file has multiple
  templates
- **Output directory** — text input if `--output` is not provided
- **Template paths** — comma-separated text input if `--templates` is not provided

In non-interactive environments (CI, piped input), missing values will cause an error instead of
prompting.

### Template Inputs

Config files can define **inputs** — custom fields that are prompted interactively and injected as
template data. This is useful for templates that need user-specific values like author name,
license, or description.

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
      private: { type: "confirm", message: "Private package?", default: false },
      port: { type: "number", message: "Dev server port", default: 3000 },
      description: { message: "Description" },
    },
  },
}
```

Each input becomes available as a Handlebars variable in your templates (e.g., `{{ author }}`,
`{{ license }}`).

**Input types:**

| Type      | Description                    | Value type |
| --------- | ------------------------------ | ---------- |
| `text`    | Free-form text input (default) | `string`   |
| `select`  | Choose from a list of options  | `string`   |
| `confirm` | Yes/no prompt                  | `boolean`  |
| `number`  | Numeric input                  | `number`   |

- **Required inputs** without a value will be prompted interactively
- **Select and confirm** inputs are always prompted (unless pre-provided)
- **Optional text/number inputs** with a `default` will use that value silently
- All inputs can be pre-provided via `--data` or `-D` to skip the prompt:

```shell
simple-scaffold -c scaffold.config.js -k component -D author=John -D license=Apache-2.0 MyComponent
```

### Before Write option

This option allows you to preprocess a file before it is being written, such as running a formatter,
linter or other commands.

To use this option, pass it the command you would like to run. The following tokens will be replaced
in your string:

- `{{path}}` - the temporary file path for you to read from
- `{{rawpath}}` - a different file path containing the raw file contents **before** they were
  handled by Handlebars.js.

If none of these tokens are found, the regular (non-raw) path will be appended to the end of the
command.

```shell
simple-scaffold -c . --before-write prettier
# command: prettier /tmp/somefile

simple-scaffold -c . --before-write 'cat {{path}} | my-linter'
# command: cat /tmp/somefile | my-linter
```

The command should return the string to write to the file through standard output (stdout), and not
re-write the tmp file as it is not used for writing. Returning an empty string (after trimming) will
discard the result and write the original file contents.

See
[beforeWrite](https://chenasraf.github.io/simple-scaffold/docs/api/interfaces/ScaffoldConfig#beforewrite)
Node.js API for more details. Instead of returning `undefined` to keep the default behavior, you can
output `''` for the same effect.

### After Scaffold option

This option runs a shell command after all files have been written. The command is executed in the
output directory, making it useful for post-scaffolding tasks like installing dependencies or
initializing a git repo.

```shell
simple-scaffold -c . --after-scaffold 'npm install'
simple-scaffold -c . --after-scaffold 'git init && git add .'
```

In a config file, you can use a function for more control:

```js
module.exports = {
  default: {
    templates: ["templates/app"],
    output: ".",
    afterScaffold: async ({ config, files }) => {
      console.log(`Created ${files.length} files in ${config.output}`)
      // run any post-processing here
    },
  },
}
```

The function receives a context with the resolved `config` and an array of `files` (absolute paths)
that were written.

## Available Commands:

| Command \| Alias | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| `init`           | Initialize a new scaffold config file and example template in the current directory. |
| `list` \| `ls`   | List all available templates for a given config. See `list -h` for more information. |

### `init`

Creates a scaffold config file and an example template directory to get you started quickly.

```shell
simple-scaffold init
```

Options:

| Option             | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `--dir` \| `-d`    | Directory to create the config in. Defaults to current directory.    |
| `--format` \| `-f` | Config format: `js`, `mjs`, or `json`. If omitted, you are prompted. |

The command creates:

- A config file (`scaffold.config.js` by default) with a `default` template key
- A `templates/default/` directory with an example `{{name}}.md` template

Existing files are never overwritten.

## Examples:

> See
> [Configuration Files](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files)
> for organizing multiple scaffold types into easy-to-maintain files

Usage with config file

```shell
$ simple-scaffold -c scaffold.cmd.js -k component MyComponent
```

Usage with GitHub config file

```shell
$ simple-scaffold -g chenasraf/simple-scaffold -k component MyComponent
```

Usage with https git URL (for non-GitHub)

```shell
$ simple-scaffold \
      -g https://example.com/user/template.git \
      -c scaffold.cmd.js \
      -k component \
      MyComponent
```

Full syntax with config path and template key (applicable to all above methods)

```shell
$ simple-scaffold -c scaffold.cmd.js -k component MyComponent
```

Excluded template key, assumes 'default' key

```shell
$ simple-scaffold -c scaffold.cmd.js MyComponent
```

Shortest syntax for GitHub, assumes file 'scaffold.cmd.js' and template key 'default'

```shell
$ simple-scaffold -g chenasraf/simple-scaffold MyComponent
```

You can also add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold-cfg": "npx simple-scaffold -c scaffold.cmd.js -k component",
    "scaffold-gh": "npx simple-scaffold -g chenasraf/simple-scaffold -k component",
    "scaffold": "npx simple-scaffold@latest -t scaffolds/component/**/* -o src/components -d '{\"myProp\": \"propName\", \"myVal\": 123}'"
    "scaffold-component":  "npx simple-scaffold -c scaffold.cmd.js -k"
  }
}
```
