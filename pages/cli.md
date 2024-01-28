## Available flags

```text
Usage: simple-scaffold [options]
```

To see this and more information anytime, add the `-h` or `--help` flag to your call, e.g.
`npx simple-scaffold@latest -h`.

| Command \| alias                  |                                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--help`\|`-h`                    | Display help information                                                                                                                                                                            |
| `--name`\|`-n`                    | Name to be passed to the generated files. {{name}} and {{Name}} inside contents and file names will be replaced accordingly.                                                                        |
| `--config`\|`-c`                  | Filename or HTTPS git URL to load config from instead of passing arguments to CLI or using a Node.js script.                                                                                        |
| `--github`\|`-gh`                 | GitHub path to load config from instead of passing arguments to CLI or using a Node.js script.                                                                                                      |
| `--key`\|`-k`                     | Key to load inside the config file. This overwrites the config key provided after the colon in --config (e.g. --config scaffold.cmd.js:component)                                                   |
| `--output`\|`-o`                  | Path to output to. If --create-sub-folder is enabled, the subfolder will be created inside this path. (default: current dir)                                                                        |
| `--templates`\|`-t`               | Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path, or a glob pattern for multiple file matching easily.                              |
| `--overwrite`\|`-w`               | Enable to override output files, even if they already exist. (default: false)                                                                                                                       |
| `--data`\|`-d`                    | Add custom data to the templates. By default, only your app name is included.                                                                                                                       |
| `--append-data`\|`-D`             | Append additional custom data to the templates, which will overwrite --data, using an alternate syntax, which is easier to use with CLI: -D key1=string -D key2:=raw                                |
| `--create-sub-folder`\|`-s`       | Create subfolder with the input name (default: false)                                                                                                                                               |
| `--sub-folder-name-helper`\|`-sh` | Default helper to apply to subfolder name when using `--create-sub-folder true`.                                                                                                                    |
| `--quiet`\|`-q`                   | Suppress output logs (Same as --log-level 0) (default: false)                                                                                                                                       |
| `--log-level`\|`-v`               | Determine amount of logs to display. The values are: 0 (none) \| 1 (debug) \| 2 (info) \| 3 (warn) \| 4 (error). The provided level will display messages of the same level or higher. (default: 2) |
| `--dry-run`\|`-dr`                | Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write actual file contents or create directories. (default: false)                     |

## Examples:

> See
> [Configuration Files](https://chenasraf.github.io/simple-scaffold/pages/docs/configuration_files.md)
> for organizing multiple scaffold types into easy-to-maintain files

Usage with config file

```shell
$ simple-scaffold -c scaffold.cmd.js --key component
```

Usage with GitHub config file

```shell
$ simple-scaffold -gh chenasraf/simple-scaffold --key component
```

Usage with https git URL (for non-GitHub)

```shell
$ simple-scaffold -c \
      https://example.com/user/template.git#scaffold.cmd.js --key component
```

Full syntax with config path and template key (applicable to all above methods)

```shell
$ simple-scaffold -c scaffold.cmd.js:component MyComponent
```

Excluded template key, assumes 'default' key

```shell
$ simple-scaffold -c scaffold.cmd.js MyComponent
```

Shortest syntax for GitHub, assumes file 'scaffold.cmd.js' and template key 'default'

```shell
$ simple-scaffold -gh chenasraf/simple-scaffold MyComponent
```

You can also add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold": "npx simple-scaffold@latest -t scaffolds/component/**/* -o src/components -d '{\"myProp\": \"propName\", \"myVal\": 123}'"
  }
}
```
