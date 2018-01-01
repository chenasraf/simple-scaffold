const Scaffolder = require('../dist/scaffold').default

const templateDir = process.cwd() + '/examples'

const scf = new Scaffolder({
  templates: [templateDir + '/test-input/Component'],
  output: templateDir + '/test-output',
  locals: {
    property: 'myProp',
    value: '"value"'
  }
}).run()
