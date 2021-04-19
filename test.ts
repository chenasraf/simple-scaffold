import SimpleScaffold from "./scaffold"
import * as path from "path"

const templateDir = path.join(process.cwd(), "examples")

new SimpleScaffold({
  templates: [templateDir + "/test-input/Component/**/*"],
  output: templateDir + "/test-output/no-create-subpath",
  createSubfolder: false,
  locals: {
    property: "myProp",
    value: '"value"',
  },
}).run()

new SimpleScaffold({
  templates: [templateDir + "/test-input/Component/**/*"],
  output: templateDir + "/test-output",
  locals: {
    property: "myProp",
    value: '"value"',
  },
}).run()

new SimpleScaffold({
  templates: [templateDir + "/test-input/Component/**/*"],
  output: (file, basedir, basename) => {
    console.log({ file, basedir, basename })
    return file
  },
  locals: {
    property: "myProp",
    value: '"value"',
  },
}).run()
