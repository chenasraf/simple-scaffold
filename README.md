# simple-scaffold

Simple Scaffold allows you to create your structured files based on templates.

## Install

You can either use it as a command line tool or import into your own code and run from there.

```bash
# npm
npm install [-g] simple-scaffold
# yarn
yarn [global] add simple-scaffold
```

## Use as a command line tool

### Command Line Options

```plaintext
Scaffold Generator

  Generate scaffolds for your project based on file templates.
  Usage: simple-scaffold scaffold-name [options]

Options

  -n, --name string                 Component output name
  -t, --templates File[]            A glob pattern of template files to load.
                                    A template file may be of any type and extension, and supports Handlebars as
                                    a parsing engine for the file names and contents, so you may customize both
                                    with variables from your configuration.
  -o, --output File                 The output directory to put the new files in. They will attempt to maintain
                                    their regular structure as they are found, if possible.
  -l, --locals Key=Value            A key-value map for the template to use in parsing.
  -w, --overwrite Boolean           Whether to overwrite files when they are found to already exist. default=true
  -S, --create-sub-folder Boolean   Whether to create a subdirectory with {{Name}} in the output directory.
                                    default=true
  -h, --help                        Display this help message
```

You can add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold": "yarn simple-scaffold --template scaffolds/component/**/* --output src/components --locals myProp=\"propname\",myVal=123"
  }
}
```

## Scaffolding

Scaffolding will replace {{vars}} in both the file name and its contents and put the transformed files
in `<output>/<{{Name}}>`, as per the Handlebars formatting rules.

Your context will be pre-populated with the following:

- `{{Name}}`: CapitalizedName of the component
- `{{name}}`: camelCasedName of the component

Any `locals` you add in the config will populate with their names wrapped in `{{` and `}}`.
They are all stringified, so be sure to parse them accordingly by creating a script, if necessary.

### Use in Node.js

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
  return fullPath
}
```

## Example Scaffold Input

### Input Directory structure

```
- project
    - scaffold
        - {{Name}}.js
    - src
        - components
        - ...
```

#### project/scaffold/{{Name}}.js

```js
const React = require('react')

module.exports = class {{Name}} extends React.Component {
  render() {
    <div className="{{className}}">{{Name}} Component</div>
  }
}
```

### Run Example

```bash
simple-scaffold MyComponent \
    -t project/scaffold/**/* \
    -o src/components \
    -l className=my-component
```

## Example Scaffold Output

#### Directory structure

```
- project
    - src
        - components
            - MyComponent
                - MyComponent.js
        - ...
```

With `createSubfolder = false`:

```
- project
    - src
        - components
            - MyComponent.js
        - ...
```

#### project/scaffold/MyComponent/MyComponent.js

```js
const React = require("react")

module.exports = class MyComponent extends React.Component {
  render() {
    ;<div className="my-component">MyComponent Component</div>
  }
}
```
