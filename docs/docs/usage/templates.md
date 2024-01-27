---
title: Template Files
---

# Preparing template files

Put your template files anywhere, and fill them with tokens for replacement.

Each template (not file) in the config array is parsed individually, and copied to the output
directory. If a single template path contains multiple files (e.g. if you use a folder path or a
glob pattern), the first directory up the tree of that template will become the base inside the
defined output path for that template, while copying files recursively and maintaining their
relative structure.

Examples:

> In the following examples, the config `name` is `AppName`, and the config `output` is `src`.

| Input template                | Files in template                                      | Output path(s)                                               |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `./templates/{{ name }}.txt`  | `./templates/{{ name }}.txt`                           | `src/AppName.txt`                                            |
| `./templates/directory`       | `outer/{{name}}.txt`,<br />`outer2/inner/{{name}}.txt` | `src/outer/AppName.txt`,<br />`src/outer2/inner/AppName.txt` |
| `./templates/others/**/*.txt` | `outer/{{name}}.jpg`,<br />`outer2/inner/{{name}}.txt` | `src/outer2/inner/AppName.txt`                               |

## Variable/token replacement

Scaffolding will replace `{{ varName }}` in both the file name and its contents and put the
transformed files in the output directory.

The data available for the template parser is the data you pass to the `data` config option (or
`--data` argument in CLI).

For example, using the following command:

```bash
npx simple-scaffold@latest \
  --templates templates/components/{{name}}.jsx \
  --output src/components \
  --create-sub-folder true \
  MyComponent
```

Will output a file with the path:

```text
<working_dir>/src/components/MyComponent.jsx
```

The contents of the file will be transformed in a similar fashion.

Your `data` will be pre-populated with the following:

- `{{Name}}`: PascalCase of the component name
- `{{name}}`: raw name of the component as you entered it

> Simple-Scaffold uses [Handlebars.js](https://handlebarsjs.com/) for outputting the file contents.
> Any `data` you add in the config will be available for use with their names wrapped in `{{` and
> `}}`. Other Handlebars built-ins such as `each`, `if` and `with` are also supported, see
> [Handlebars.js Language Features](https://handlebarsjs.com/guide/#language-features) for more
> information.

## Helpers

### Built-in Helpers

Simple-Scaffold provides some built-in text transformation filters usable by Handlebars.

For example, you may use `{{ snakeCase name }}` inside a template file or filename, and it will
replace `My Name` with `my_name` when producing the final value.

#### Capitalization Helpers

| Helper name  | Example code            | Example output |
| ------------ | ----------------------- | -------------- |
| [None]       | `{{ name }}`            | my name        |
| `camelCase`  | `{{ camelCase name }}`  | myName         |
| `snakeCase`  | `{{ snakeCase name }}`  | my_name        |
| `startCase`  | `{{ startCase name }}`  | My Name        |
| `kebabCase`  | `{{ kebabCase name }}`  | my-name        |
| `hyphenCase` | `{{ hyphenCase name }}` | my-name        |
| `pascalCase` | `{{ pascalCase name }}` | MyName         |
| `upperCase`  | `{{ upperCase name }}`  | MY NAME        |
| `lowerCase`  | `{{ lowerCase name }}`  | my name        |

#### Date helpers

| Helper name                      | Description                                                      | Example code                                                     | Example output     |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| `now`                            | Current date with format                                         | `{{ now "yyyy-MM-dd HH:mm" }}`                                   | `2042-01-01 15:00` |
| `now` (with offset)              | Current date with format, and with offset                        | `{{ now "yyyy-MM-dd HH:mm" -1 "hours" }}`                        | `2042-01-01 14:00` |
| `date`                           | Custom date with format                                          | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" }}`           | `2042-01-01 15:00` |
| `date` (with offset)             | Custom date with format, and with offset                         | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" -1 "days" }}` | `2041-31-12 15:00` |
| `date` (with date from `--data`) | Custom date with format, with data from the `data` config option | `{{ date myCustomDate "yyyy-MM-dd HH:mm" }}`                     | `2042-01-01 12:00` |

Further details:

- We use [`date-fns`](https://date-fns.org/docs/) for parsing/manipulating the dates. If you want
  more information on the date tokens to use, refer to
  [their format documentation](https://date-fns.org/docs/format).

- The date helper format takes the following arguments:

  ```typescript
  (
    date: string,
    format: string,
    offsetAmount?: number,
    offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"
  )
  ```

- **The now helper** (for current time) takes the same arguments, minus the first one (`date`) as it
  is implicitly the current date.

### Custom Helpers

You may also add your own custom helpers using the `helpers` options when using the JS API (rather
than the CLI). The `helpers` option takes an object whose keys are helper names, and values are the
transformation functions. For example, `upperCase` is implemented like so:

```typescript
config.helpers = {
  upperCase: (text) => text.toUpperCase(),
}
```

All of the above helpers (built in and custom) will also be available to you when using
`subFolderNameHelper` (`--sub-folder-name-helper`/`-sh`) as a possible value.

> To see more information on how helpers work and more features, see
> [Handlebars.js docs](https://handlebarsjs.com/guide/#custom-helpers).

# Examples

## Run

### Command Example

```bash
simple-scaffold MyComponent \
    -t project/scaffold/**/* \
    -o src/components \
    -d '{"className": "myClassName","author": "Chen Asraf"}'
    MyComponent
```

### Equivalent Node Module Example

```typescript
import Scaffold from "simple-scaffold"

async function main() {
  await Scaffold({
    name: "MyComponent",
    templates: ["project/scaffold/**/*"],
    output: ["src/components"],
    data: {
      className: "myClassName",
      author: "Chen Asraf",
    },
  })
  console.log("Done.")
}
```

## Files

### Input

- Input file path:

  ```text
  project → scaffold → {{Name}}.js → src → components
  ```

- Input file contents:

  ```typescript
  /**
   * Author: {{ author }}
   * Date: {{ now "yyyy-MM-dd" }}
   */
  import React from 'react'

  export default {{camelCase name}}: React.FC = (props) => {
    return (
      <div className="{{className}}">{{camelCase name}} Component</div>
    )
  }
  ```

### Output

- Output file path:

  - With `createSubFolder = false` (default):

    ```text
    project → src → components → MyComponent.js
    ```

  - With `createSubFolder = true`:

    ```text
    project → src → components → MyComponent → MyComponent.js
    ```

  - With `createSubFolder = true` and `subFolderNameHelper = 'upperCase'`:

    ```text
    project → src → components → MYCOMPONENT → MyComponent.js
    ```

- Output file contents:

  ```typescript
  /**
   * Author: Chen Asraf
   * Date: 2077-01-01
   */
  import React from 'react'

  export default MyComponent: React.FC = (props) => {
    return (
      <div className="myClassName">MyComponent Component</div>
    )
  }
  ```
