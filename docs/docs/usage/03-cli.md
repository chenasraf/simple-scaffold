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

| Option/flag \| Alias                              | Description                                                                                                                                                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name` \| `-n`                                  | Name to be passed to the generated files. `{{name}}` and other data parameters inside contents and file names will be replaced accordingly. You may omit the `--name` or `-n` for this specific option.  |
| `--config` \| `-c`                                | Filename or directory to load config from                                                                                                                                                                |
| `--git` \| `-g`                                   | Git URL or GitHub path to load a template from.                                                                                                                                                          |
| `--key` \| `-k`                                   | Key to load inside the config file. This overwrites the config key provided after the colon in `--config` (e.g. `--config scaffold.cmd.js:component)`                                                    |
| `--output` \| `-o`                                | Path to output to. If `--subdir` is enabled, the subdir will be created inside this path. Default is current working directory.                                                                          |
| `--templates` \| `-t`                             | Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, or a glob pattern for multiple file matching easily.                                   |
| `--overwrite` \| `-w` \| `--no-overwrite` \| `-W` | Enable to override output files, even if they already exist. (default: false)                                                                                                                            |
| `--data` \| `-d`                                  | Add custom data to the templates. By default, only your app name is included.                                                                                                                            |
| `--append-data` \| `-D`                           | Append additional custom data to the templates, which will overwrite `--data`, using an alternate syntax, which is easier to use with CLI: `-D key1=string -D key2:=raw`                                 |
| `--subdir` \| `-s` \| `--no-subdir` \| `-S`       | Create a parent directory with the input name (and possibly `--subdir-helper` (default: false)                                                                                                           |
| `--subdir-helper` \| `-H`                         | Default helper to apply to subdir name when using `--subdir`.                                                                                                                                            |
| `--quiet` \| `-q`                                 | Suppress output logs (Same as `--log-level none`)(default: false)                                                                                                                                        |
| `--log-level` \| `-l`                             | Determine amount of logs to display. The values are: `none, debug, info, warn, error`. The provided level will display messages of the same level or higher. (default: info)                             |
| `--before-write` \| `-B`                          | Run a script before writing the files. This can be a command or a path to a file. A temporary file path will be passed to the given command and the command should return a string for the final output. |
| `--dry-run` \| `-dr`                              | Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write actual file contents or create directories. (default: false)                          |
| `--version` \| `-v`                               | Display version.                                                                                                                                                                                         |

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

## Available Commands:

| Command \| Alias | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| `list` \| `ls`   | List all available templates for a given config. See `list -h` for more information. |

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
