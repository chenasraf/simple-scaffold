import Scaffold from "./scaffold"

Scaffold({
  name: "sample_app",
  outputPath: "examples/test-output",
  templates: ["examples/test-input/Component"],
  overwrite: true,
  data: {
    property: "myProp",
    value: "10",
  },
})
Scaffold({
  name: "sample_app_with_subdir",
  outputPath: "examples/test-output",
  templates: ["examples/test-input/Component"],
  createSubfolder: true,
  data: {
    property: "myProp",
    value: "10",
  },
})
