# scaffolder
Scaffolder allows you to create your structured files based on templates.

## Install
You can either use it as a command line tool or import into your own code and run from there.

You can install simple-scaffold globally like so:

```bash
# npm
npm install -g simple-scaffold
# yarn
yarn global add simple-scaffold
```

## Use as a command line tool
### Command line options

```bash
simple-scaffold MyComponent --template scaffolds/component/**/* \
    --output src/components \
    --locals myProp="propname",myVal=123
```

##### `--template glob [--template glob2 [...]]`
A glob pattern of template files to load.


A template file may be of any type and extension, and supports [Handlebars](https://handlebarsjs.com) as a parsing engine for the file names and contents, so you may customize both with variables from your configuration.

You may load more than one template list by simple adding more `--template` arguments.

##### `--output path`
The output directory to put the new files in. They will attempt to maintain their regular structure as they are found, if possible.

Your new scaffold will be placed under a directory with the scaffold name from the argumemts.

You may also pass a function to transform the output path for each file individually.
This function takes 2 arguments: filename, and base glob path

##### `--locals key=value[,key=value[,...]]`
Pass a KV map to the template for parsing.

### Use in Node.js
You can also build the scaffold yourself.
Simply pass a config object to the constructor, and invoke `run()` when you are ready to start.
The config takes the same arguments as the command line:

```javascript
const SimpleScaffold = require('simple-scaffold').default

const scaffold = new SimpleScaffold({
  name: 'component',
  templates: [path.join(__dirname, 'scaffolds', 'component')],
  output: path.join(__dirname, 'src', 'components'),
  locals: {
    property: 'value',
  }
})
```
