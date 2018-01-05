import SimpleScaffold from './scaffold'
import * as path from 'path'

const templateDir = path.join(process.cwd(), 'examples')

new SimpleScaffold({
  templates: [templateDir + '/test-input/Component/**/*'],
  output: templateDir + '/test-output',
  locals: {
    property: 'myProp',
    value: '"value"'
  }
}).run()
