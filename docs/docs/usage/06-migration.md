---
title: Migration
---

# Migration

## v1.x to v2.x

### CLI Changes

**Remote config syntax:**

- The `:template_key` suffix syntax has been removed. Use `-k template_key` instead.
- `--github` (`-gh`) is now `--git` (`-g`) and supports any Git URL. GitHub shorthand still works:
  `-g username/project`.
- The `#template_file` suffix syntax has been removed. Use `--config` (`-c`) to specify which file
  to look for inside the Git project.

**Renamed flags:**

| v1.x                               | v2.x                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `--create-sub-folder` / `-s`       | `--subdir` / `-s`                                        |
| `--sub-folder-name-helper` / `-sh` | `--subdir-helper` / `-H`                                 |
| `--verbose` (true/false)           | `--log-level` (`debug`, `info`, `warn`, `error`, `none`) |

**Boolean flags** no longer take a value. Use `-q` instead of `-q true`, `-s` instead of `-s 1`,
etc.

### Behavior Changes

**`{{ Name }}` removed.** The auto-populated `Name` (PascalCase) variable is gone. Use
`{{ pascalCase name }}` in your templates instead. If you need the old behavior, inject it manually
via `data`:

```js
module.exports = {
  default: {
    templates: ["templates/default"],
    output: "src",
    data: { Name: "{{ pascalCase name }}" }, // or set it programmatically
  },
}
```

## v0.x to v1.x

In v1.0, the codebase was overhauled but usage remained mostly the same.

### API Changes

| v0.x                             | v1.x                                       |
| -------------------------------- | ------------------------------------------ |
| `new SimpleScaffold(opts).run()` | `SimpleScaffold(opts)` (returns a Promise) |
| `locals` option                  | `data` option                              |
| `--locals` / `-l` flag           | `--data` / `-d` flag                       |

### Template Syntax

Templates still use Handlebars.js. v1.x added **built-in helpers** (case transformations, date
formatting), removing the need to pre-process template data for common operations like `camelCase`,
`snakeCase`, etc.

See [Templates](templates#built-in-helpers) for the full list of available helpers.
