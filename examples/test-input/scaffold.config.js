/** @type {import('simple-scaffold').ScaffoldConfigFile} */
module.exports = {
  default: {
    templates: ["examples/test-input/Component"],
    output: "examples/test-output",
    data: { property: "myProp", value: "10" },
  },
  component: {
    templates: ["examples/test-input/Component"],
    output: "examples/test-output/component",
    data: { property: "myProp", value: "10" },
  },
}
