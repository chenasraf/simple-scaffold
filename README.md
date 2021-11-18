# simple-scaffold

Simple Scaffold allows you to create your structured files based on templates.

## Install

You can either use it as a command line tool or import into your own code and run from there.

```bash
# npm
npm install [-g] simple-scaffold
# yarn
yarn [global] add simple-scaffold
# run without installing
npx simple-scaffold <...args>
```

## Use as a command line tool

### Command Line Options

```plaintext
Usage: simple-scaffold [options]

Options:

  --help|-h                 Display help information

  --name|-n                 Name to be passed to the generated files. {{name}} and
                            {{Name}} inside contents and file names will be replaced
                            accordingly.

  --output|-o               Path to output to. If --create-sub-folder is enabled, the
                            subfolder will be created inside this path.

  --templates|-t            Template files to use as input. You may provide multiple
                            files, each of which can be a relative or absolute path, or a glob
                            pattern for multiple file matching easily.

  --overwrite|-w            Enable to override output files, even if they already exist.
                            (default: false)

  --data|-d                 Add custom data to the templates. By default, only your app
                            name is included.

  --create-sub-folder|-s    Create subfolder with the input name (default:
                            false)

  --quiet|-q                Suppress output logs (default:
                            false)

  --dry-run|-dr             Don't emit actual files. This is good for testing your
                            scaffolds and making sure they don't fail, without having to write
                            actual files. (default: false)
```

You can also add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold": "yarn simple-scaffold --templates scaffolds/component/**/* --output src/components --data '{\"myProp\": \"propName\", \"myVal\": \"123\"}'"
  }
}
```

## Use in Node.js

You can also build the scaffold yourself, if you want to create more complex arguments or scaffold groups.
Simply pass a config object to the constructor, and invoke `run()` when you are ready to start.
The config takes similar arguments to the command line:

```javascript
const SimpleScaffold = require("simple-scaffold").default

const scaffold = new SimpleScaffold({
  name: "component",
  templates: [path.join(__dirname, "scaffolds", "component")],
  output: path.join(__dirname, "src", "components"),
  createSubFolder: true,
  locals: {
    property: "value",
  },
}).run()
```

The exception in the config is that `output`, when used in Node directly, may also be passed a
function for each input file to output into a dynamic path:

```javascript
config.output = (fullPath, baseDir, baseName) => {
  console.log({ fullPath, baseDir, baseName })
  return [baseDir, baseName].join(path.sep)
}
```

## Preparing files

### Template files

Put your template files anywhere, and fill them with tokens for replacement.

### Variable/token replacement

Scaffolding will replace `{{ varName }}` in both the file name and its contents and put the
transformed files in the output directory.

The data available for the template parser is the data you pass to the `data` config option (or
`--data` argument in CLI).

Your `data` will be pre-populated with the following:

- `{{Name}}`: PascalCase of the component name
- `{{name}}`: raw name of the component

> Simple-Scaffold uses [Handlebars.js](https://handlebarsjs.com/) for outputting the file contents,
> see their documentation for more information on syntax.
> Any `data` you add in the config will be available for use with their names wrapped in
> `{{` and `}}`.

Simple-Scaffold provides some built-in text transformation filters usable by handleBars.

For example, you may use `{{ name | snakeCase }}` inside a template file or filename, and it will
replace `My Name` with `my_name` when producing the final value.

Here are the built-in helpers available for use:

```plaintext
{{ name | camelCase }}    =>    myName
{{ name | snakeCase }}    =>    my_name
{{ name | startCase }}    =>    My Name
{{ name | kebabCase }}    =>    my-name
{{ name | hyphenCase }}   =>    my-name
{{ name | pascalCase }}   =>    MyName
```

**Note:** These helpers are available for any data property, not exclusive to `name`.

## Examples

### Command Example

```bash
simple-scaffold MyComponent \
    -t project/scaffold/**/* \
    -o src/components \
    -d '{"className":"myClassName"}'
```

### Example Scaffold Input

#### Input Directory structure

```plaintext
- project
  - scaffold
    - {{Name}}.js
  - src
    - components
    - ...
```

#### Contents of `project/scaffold/{{Name}}.js`

```js
const React = require('react')

module.exports = class {{Name}} extends React.Component {
  render() {
    <div className="{{className}}">{{Name}} Component</div>
  }
}
```

### Example Scaffold Output

### Output directory structure

```plaintext
- project
  - src
    - components
      - MyComponent
        - MyComponent.js
    - ...
```

With `createSubfolder = false`:

```plaintext
- project
  - src
    - components
      - MyComponent.js
    - ...
```

#### Contents of `project/scaffold/MyComponent/MyComponent.js`

```js
const React = require("react")

module.exports = class MyComponent extends React.Component {
  render() {
    <div className="myClassName">MyComponent Component</div>
  }
}
```
