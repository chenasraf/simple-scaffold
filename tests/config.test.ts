import { ScaffoldCmdConfig } from "../src/types"
import { OptionsBase } from "massarg/types"
import * as config from "../src/config"
import { resolve } from "../src/utils"

const { getConfig, githubPartToUrl, parseAppendData, parseConfig, parseConfigSelection } = config

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

jest.mock("../src/config", () => {
  console.log("mocking config")
  return {
    ...jest.requireActual("../src/config"),
    getGitConfig: () => Promise.resolve({ default: blankCliConf }),
  }
})

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
    test("separate key", () => {
      expect(parseConfigSelection("scaffold.config.js", "component")).toEqual({
        configFile: "scaffold.config.js",
        key: "component",
        isRemote: false,
      })
    })
    test("key override", () => {
      expect(parseConfigSelection("scaffold.config.js:component", "main")).toEqual({
        configFile: "scaffold.config.js",
        key: "main",
        isRemote: false,
      })
    })
    test("isRemote: false", () => {
      expect(parseConfigSelection("scaffold.config.js", "main")).toEqual({
        configFile: "scaffold.config.js",
        key: "main",
        isRemote: false,
      })
    })
    test("isRemote: true", () => {
      expect(
        parseConfigSelection("https://github.com/chenasraf/simple-scaffold.git#scaffold.config.js:component", "main"),
      ).toEqual({
        configFile: "https://github.com/chenasraf/simple-scaffold.git#scaffold.config.js",
        key: "main",
        isRemote: true,
      })
    })
  })

  describe("parseConfig", () => {
    test("normal config does not change", async () => {
      expect(
        await parseConfig({
          ...blankCliConf,
        }),
      ).toEqual(blankCliConf)
    })
    describe("appendData", () => {
      test("appends", async () => {
        const result = await parseConfig({
          ...blankCliConf,
          appendData: { key: "value" },
        })
        expect(result?.data?.key).toEqual("value")
      })
      test("overwrites existing value", async () => {
        const result = await parseConfig({
          ...blankCliConf,
          data: { num: "123" },
          appendData: { num: "1234" },
        })
        expect(result?.data?.num).toEqual("1234")
      })
    })
    // describe("remote config", () => {
    //   test("works", async () => {
    //     // mock
    //     const result = await parseConfig({
    //       ...blankCliConf,
    //       config: "https://github.com/chenasraf/simple-scaffold",
    //     })
    //   })
    // })
  })

  // TODO find how to mock getGitConfig properly
  //
  // describe("getConfig", () => {
  //   test("gets git config", async () => {
  //     // const original = config.githubPartToUrl
  //     // config.githubPartToUrl = jest.fn().mockReturnValue(Promise.resolve(blankCliConf))
  //     // const spy = jest.spyOn(config, "parseConfig").mockReturnValue(Promise.resolve(blankCliConf))
  //
  //     // jest.spyOn(config, "getGitConfig").mockImplementation(() => Promise.resolve({ default: blankCliConf }))
  //     // jest.mock("../src/config", () => ({
  //     //   ...jest.requireActual("../src/config"),
  //     //   getGitConfig: () => Promise.resolve({ default: blankCliConf }),
  //     // }))
  //     const resultFn = await config.getConfig({
  //       config: "https://github.com/chenasraf/simple-scaffold.git",
  //       isRemote: true,
  //       quiet: true,
  //       verbose: 0,
  //     })
  //     const result = await resolve(resultFn, blankCliConf)
  //     expect(result).toEqual({ default: blankCliConf })
  //     // expect(spy.)
  //     // config.githubPartToUrl = original
  //   })
  // })
})
