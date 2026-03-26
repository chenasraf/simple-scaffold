---
title: CLI
---

# CLI

```sh
npx simple-scaffold [options] [name]
```

Use `--help` (`-h`) to see all available options at any time.

## Commands

| Command       | Description                               |
| ------------- | ----------------------------------------- |
| _(default)_   | Generate files from a template            |
| `init`        | Create a config file and example template |
| `list` / `ls` | List available template keys in a config  |

### `init`

Scaffolds a config file and example template directory to get you started:

```sh
npx simple-scaffold init
npx simple-scaffold init --format mjs
npx simple-scaffold init --dir packages/my-lib
```

| Option            | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `--dir` / `-d`    | Directory to create the config in (defaults to current directory) |
| `--format` / `-f` | Config format: `js`, `mjs`, or `json` (prompts if omitted)        |

Creates:

- A config file (`scaffold.config.js` by default) with a `default` template key
- A `templates/default/` directory with an example `{{name}}.md` template

Existing files are never overwritten.

### `list`

Lists all template keys defined in a config file:

```sh
npx simple-scaffold list
npx simple-scaffold list -c path/to/config.js
npx simple-scaffold list -g username/repo
```

## Options

| Flag                             | Short     | Description                                           | Default         |
| -------------------------------- | --------- | ----------------------------------------------------- | --------------- |
| `--name`                         | `-n`      | Name for generated files (can also be positional arg) |                 |
| `--config`                       | `-c`      | Path to config file or directory                      | _(auto-detect)_ |
| `--git`                          | `-g`      | Git URL or GitHub shorthand (`user/repo`)             |                 |
| `--key`                          | `-k`      | Template key from config                              | `default`       |
| `--output`                       | `-o`      | Output directory                                      |                 |
| `--templates`                    | `-t`      | Template paths or glob patterns (repeatable)          |                 |
| `--data`                         | `-d`      | Custom data as JSON string                            |                 |
| `--append-data`                  | `-D`      | Key-value data (`key=string`, `key:=raw`), repeatable |                 |
| `--subdir` / `--no-subdir`       | `-s`/`-S` | Create parent directory with the input name           | `false`         |
| `--subdir-helper`                | `-H`      | Helper to transform subdir name                       |                 |
| `--overwrite` / `--no-overwrite` | `-w`/`-W` | Overwrite existing files                              | `false`         |
| `--dry-run`                      | `-dr`     | Preview output without writing files                  | `false`         |
| `--before-write`                 | `-B`      | Command to run before each file is written            |                 |
| `--after-scaffold`               | `-A`      | Shell command to run after all files are written      |                 |
| `--quiet`                        | `-q`      | Suppress output (same as `--log-level none`)          |                 |
| `--log-level`                    | `-l`      | Log level: `none`, `debug`, `info`, `warn`, `error`   | `info`          |
| `--version`                      | `-v`      | Show version                                          |                 |
| `--help`                         | `-h`      | Show help                                             |                 |

## Interactive Mode

When running in a terminal (TTY), Simple Scaffold prompts for any missing required values:

- **Name** — if `--name` is not provided
- **Template key** — if `--key` is not provided and the config has multiple templates
- **Output directory** — if `--output` is not provided
- **Template paths** — if `--templates` is not provided (comma-separated)

[Inputs](configuration_files#inputs) defined in config files are also prompted interactively.

In non-interactive environments (CI, piped input), missing required values cause an error.

## Hooks

### Before Write

Runs a command before each file is written. The command receives a temporary file path and should
output the final content to stdout.

```sh
# Appends file path automatically
npx simple-scaffold -c . --before-write prettier

# Use tokens for explicit control
npx simple-scaffold -c . --before-write 'cat {{path}} | my-linter'
```

**Tokens:**

- `{{path}}` — temporary file path with Handlebars-processed contents
- `{{rawpath}}` — temporary file path with raw (unprocessed) contents

If no tokens are found, `{{path}}` is appended automatically. Returning an empty string (after
trimming) discards the result and writes the original contents.

### After Scaffold

Runs a shell command after all files are written. The command executes in the output directory:

```sh
npx simple-scaffold -c . --after-scaffold 'npm install'
npx simple-scaffold -c . --after-scaffold 'git init && git add .'
```

See the [Node.js API](node#after-scaffold-hook) for the function-based equivalent.

## CLI Examples

```sh
# Use auto-detected config, default key
npx simple-scaffold MyProject

# Specify config and key
npx simple-scaffold -c scaffold.config.js -k component MyComponent

# GitHub remote template
npx simple-scaffold -g username/repo -k component MyComponent

# Full Git URL
npx simple-scaffold -g https://gitlab.com/user/repo.git -k component MyComponent

# One-off (no config file)
npx simple-scaffold -t templates/component -o src/components MyComponent

# With custom data
npx simple-scaffold -k component -D author=John -D license:='"MIT"' MyComponent

# Dry run
npx simple-scaffold -k component --dry-run MyComponent
```

### package.json Scripts

```json
{
  "scripts": {
    "scaffold": "simple-scaffold -k component",
    "scaffold:page": "simple-scaffold -k page"
  }
}
```

```sh
npm run scaffold -- MyComponent
npm run scaffold:page -- Dashboard
```
