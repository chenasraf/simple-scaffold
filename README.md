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
The first non-token argument (that has no `--` prefix) will be used as the scaffold name.
The rest is ignored, of course except for the available arguments below.

```bash
simple-scaffold MyComponent --template scaffolds/component/**/* \
    --output src/components \
    --locals myProp="propname",myVal=123
```

You can add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold": "node node_modules/simple-scaffold/dist/cmd.js --template scaffolds/component/**/* --output src/components --locals myProp=\"propname\",myVal=123"
  }
}
```

## Scaffolding
Scaffolding will replace {{vars}} in both the file name and its contents and put the transformed files
in `<output>/<{{Name}}`.

Your context will be pre-populated with the following:
- `{{Name}}`: CapitalizedName of the component
- `{{name}}`: camelCasedName of the component

Any `locals` you add in the config will populate with their names wrapped in `{{` and `}}`.
They are all stringified, so be sure to parse them accordingly by creating a script, if necessary.

### Command line options
##### `--template glob [--template glob2 [...]]` (required)
A glob pattern of template files to load.

A template file may be of any type and extension, and supports [Handlebars](https://handlebarsjs.com) as a parsing engine for the file names and contents, so you may customize both with variables from your configuration.

You can load more than one template list by simple adding more `--template` arguments.

##### `--output path` (optional)
The output directory to put the new files in. They will attempt to maintain their regular structure as they are found, if possible.

Your new scaffold will be placed under a directory with the scaffold name from the argumemts.

You may also pass a function to transform the output path for each file individually.
This function takes 2 arguments: filename, and base glob path

##### `--locals key=value[,key=value[,...]]` (optional)
Pass a KV map to the template for parsing.

### Use in Node.js
You can also build the scaffold yourself, if you want to create more complex arguments or scaffold groups.
Simply pass a config object to the constructor, and invoke `run()` when you are ready to start.
The config takes similar arguments to the command line:

```javascript
const SimpleScaffold = require('simple-scaffold').default

const scaffold = new SimpleScaffold({
  name: 'component',
  templates: [path.join(__dirname, 'scaffolds', 'component')],
  output: path.join(__dirname, 'src', 'components'),
  locals: {
    property: 'value',
  }
}).run()
```

## Example Scaffold Input

### Input Directory structure
```
- project
    - scaffold
        - {{Name}}.js
        - {{Name}}.css
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
    --template project/scaffold/**/* \
    --output src/components \
    --locals 'className=my-component`
```

## Example Scaffold Output
#### Directory structure
```
- project
    - src
        - components
            - MyComponent
                - MyComponent.css
        - ...
```

#### project/scaffold/MyComponent/MyComponent.js
```js
const React = require('react')

module.exports = class MyComponent extends React.Component {
  render() {
    <div className="my-component">MyComponent Component</div>
  }
}
```
