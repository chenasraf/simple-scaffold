---
title: Templates
---

# Templates

Templates are regular files in a directory. Both **file names** and **file contents** support
[Handlebars.js](https://handlebarsjs.com/) syntax for token replacement.

## How Templates Are Resolved

Each path in the `templates` array is resolved individually. If a path points to a directory or glob
pattern containing multiple files, the first directory up the tree becomes the base path — files are
then copied recursively into `output`, preserving their relative structure.

> In the examples below, `name` is `AppName` and `output` is `src`.

| Template path                 | Files found                                            | Output                                                       |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `./templates/{{ name }}.txt`  | `./templates/{{ name }}.txt`                           | `src/AppName.txt`                                            |
| `./templates/directory`       | `outer/{{name}}.txt`,<br />`outer2/inner/{{name}}.txt` | `src/outer/AppName.txt`,<br />`src/outer2/inner/AppName.txt` |
| `./templates/others/**/*.txt` | `outer/{{name}}.jpg`,<br />`outer2/inner/{{name}}.txt` | `src/outer2/inner/AppName.txt`                               |

### Glob Patterns & Exclusions

Template paths support glob patterns and negation with `!`:

```js
{
  templates: ["templates/component/**", "!templates/component/README.md"]
}
```

## Ignoring Files

Place a `.scaffoldignore` file in your template directory to exclude files. It works like
`.gitignore` — one pattern per line, `#` for comments.

```text
# .scaffoldignore
*.log
node_modules
README.md
dist/**
```

The `.scaffoldignore` file itself is never copied to the output.

Patterns are matched against both the file's basename and its path relative to the template
directory, so `README.md` matches at any depth while `dist/**` only matches a `dist` directory at
the template root.

## Token Replacement

Handlebars expressions like `{{ name }}` are replaced in both file names and file contents. The
`name` variable is always available — it's the name you pass when running the scaffold.

Any additional data from `--data`, `-D`, `data` config, or [inputs](configuration_files#inputs) is
also available.

```bash
npx simple-scaffold \
  -t templates/component/{{name}}.jsx \
  -o src/components \
  MyComponent
```

This produces `src/components/MyComponent.jsx`, with all tokens inside the file replaced as well.

All standard Handlebars features work — `{{#if}}`, `{{#each}}`, `{{#with}}`, and more. See
[Handlebars.js Language Features](https://handlebarsjs.com/guide/#language-features) for details.

## Built-in Helpers

Simple Scaffold includes helpers you can use in templates and file names. Helpers can also be
nested: `{{ pascalCase (snakeCase name) }}`.

### Case Helpers

| Helper       | Usage                   | `my name` becomes |
| ------------ | ----------------------- | ----------------- |
| _(none)_     | `{{ name }}`            | `my name`         |
| `camelCase`  | `{{ camelCase name }}`  | `myName`          |
| `pascalCase` | `{{ pascalCase name }}` | `MyName`          |
| `snakeCase`  | `{{ snakeCase name }}`  | `my_name`         |
| `kebabCase`  | `{{ kebabCase name }}`  | `my-name`         |
| `hyphenCase` | `{{ hyphenCase name }}` | `my-name`         |
| `startCase`  | `{{ startCase name }}`  | `My Name`         |
| `upperCase`  | `{{ upperCase name }}`  | `MY NAME`         |
| `lowerCase`  | `{{ lowerCase name }}`  | `my name`         |

### Date Helpers

Both `now` and `date` use [`date-fns`](https://date-fns.org/docs/format) format tokens.

| Helper               | Example                                                          | Output              |
| -------------------- | ---------------------------------------------------------------- | ------------------- |
| `now`                | `{{ now "yyyy-MM-dd HH:mm" }}`                                   | `2042-01-01 15:00`  |
| `now` (with offset)  | `{{ now "yyyy-MM-dd HH:mm" -1 "hours" }}`                        | `2042-01-01 14:00`  |
| `date`               | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" }}`           | `2042-01-01 15:00`  |
| `date` (with offset) | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" -1 "days" }}` | `2041-12-31 15:00`  |
| `date` (from data)   | `{{ date myCustomDate "yyyy-MM-dd HH:mm" }}`                     | _(depends on data)_ |

**Signatures:**

```typescript
now(format: string, offsetAmount?: number, offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds")

date(date: string, format: string, offsetAmount?: number, offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds")
```

## Custom Helpers

You can register custom Handlebars helpers via the `helpers` config option:

```js
module.exports = {
  component: {
    templates: ["templates/component"],
    output: "src/components",
    helpers: {
      shout: (text) => text.toUpperCase() + "!!!",
    },
  },
}
```

Then use in templates: `{{ shout name }}`.

All helpers (built-in and custom) are also available as values for `subdirHelper` (`--subdir-helper`
/ `-H`).

For more on Handlebars helpers, see the
[Handlebars.js docs](https://handlebarsjs.com/guide/#custom-helpers).
