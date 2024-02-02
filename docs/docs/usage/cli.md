---
title: CLI Usage
---

## Available flags

```text
Usage: simple-scaffold [options]
```

To see this and more information anytime, add the `-h` or `--help` flag to your call, e.g.
`npx simple-scaffold@latest -h`.

| Command \| alias                    |                                                                                                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name` \| `-n`                    | Name to be passed to the generated files. `{{name}}` and other data parameters inside contents and file names will be replaced accordingly. You may omit the `--name` or `-n` for this specific option.                                                                    |
| `--config`\|`-c`                    | Filename to load config from instead of passing arguments to CLI or using a Node.js script. See examples for syntax. This can also work in conjunction with `--git` or `--github` to point to remote files, and with `--key` to denote which key to select from the file., |
| `--git`\|`-g`                       | Git URL to load config from instead of passing arguments to CLI or using a Node.js script. See examples for syntax.                                                                                                                                                        |
| `--key` \| `-k`                     | Key to load inside the config file. This overwrites the config key provided after the colon in `--config` (e.g. `--config scaffold.cmd.js:component`)                                                                                                                      |
| `--output` \| `-o`                  | Path to output to. If `--create-sub-folder` is enabled, the subfolder will be created inside this path. Default is current working directory.                                                                                                                              |
| `--templates` \| `-t`               | Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, or a glob pattern for multiple file matching easily.                                                                                                     |
| `--overwrite` \| `-w`               | Enable to override output files, even if they already exist.                                                                                                                                                                                                               |
| `--data` \| `-d`                    | Add custom data to the templates. By default, only your app name is included.                                                                                                                                                                                              |
| `--append-data` \| `-D`             | Append additional custom data to the templates, which will overwrite `--data`, using an alternate syntax, which is easier to use with CLI: `-D key1=string -D key2:=raw`                                                                                                   |
| `--create-sub-folder` \| `-s`       | Create subfolder with the input name                                                                                                                                                                                                                                       |
| `--sub-folder-name-helper` \| `-sh` | Default helper to apply to subfolder name when using `--create-sub-folder true`.                                                                                                                                                                                           |
| `--quiet` \| `-q`                   | Suppress output logs (Same as `--log-level none`)                                                                                                                                                                                                                          |
| `--log-level` \| `-l`               | Determine amount of logs to display. The values are: `none \| debug \| info \| warn \| error`. The provided level will display messages of the same level or higher.                                                                                                       |
| `--dry-run` \| `-dr`                | Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write actual file contents or create directories.                                                                                                             |
| `--help` \| `-h`                    | Show this help message                                                                                                                                                                                                                                                     |
| `--version` \| `-v`                 | Display version.                                                                                                                                                                                                                                                           |

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
