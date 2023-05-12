import { ScaffoldCmdConfig } from "../src/types"
import { OptionsBase } from "massarg/types"
import { githubPartToUrl, parseAppendData, parseConfigSelection } from "../src/config"

const blankCliConf: ScaffoldCmdConfig & OptionsBase = {
  verbose: 0,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
  overwrite: false,
  createSubFolder: false,
  dryRun: false,
  quiet: false,
  extras: [],
  help: false,
}

describe("config", () => {
  describe("parseAppendData", () => {
    test('works for "key=value"', () => {
      expect(parseAppendData("key=value", blankCliConf)).toEqual({ key: "value", name: "test" })
    })

    test('works for "key:=value"', () => {
      expect(parseAppendData("key:=123", blankCliConf)).toEqual({ key: 123, name: "test" })
    })

    test("overwrites existing value", () => {
      expect(parseAppendData("name:=123", blankCliConf)).toEqual({ name: 123 })
    })

    test("works with quotes", () => {
      expect(parseAppendData('key="value test"', blankCliConf)).toEqual({ key: "value test", name: "test" })
    })
  })
  describe("githubPartToUrl", () => {
    test("works", () => {
      expect(githubPartToUrl("chenasraf/simple-scaffold")).toEqual("https://github.com/chenasraf/simple-scaffold.git")
      expect(githubPartToUrl("chenasraf/simple-scaffold.git")).toEqual(
        "https://github.com/chenasraf/simple-scaffold.git",
      )
    })
  })
  describe("parseConfigSelection", () => {
    test("works", () => {
      expect(parseConfigSelection("scaffold.config.js", "component")).toEqual({
        configFile: "scaffold.config.js",
        key: "component",
      })
      expect(parseConfigSelection("scaffold.config.js:component", "main")).toEqual({
        configFile: "scaffold.config.js",
        key: "main",
      })
      expect(parseConfigSelection("scaffold.config.js", "main")).toEqual({
        configFile: "scaffold.config.js",
        key: "main",
      })
    })
  })
})
