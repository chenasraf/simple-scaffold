import { LogLevel, ScaffoldCmdConfig } from "../src/types"
import * as config from "../src/config"
import { resolve } from "../src/utils"
// @ts-ignore
import * as configFile from "../scaffold.config"

jest.mock("../src/git", () => {
  return {
    __esModule: true,
    ...jest.requireActual("../src/git"),
    getGitConfig: () => {
      return Promise.resolve(blankCliConf)
    },
  }
})

const { githubPartToUrl, parseAppendData, parseConfigFile } = config

const blankCliConf: ScaffoldCmdConfig = {
  logLevel: LogLevel.none,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
  overwrite: false,
  createSubFolder: false,
  dryRun: false,
  quiet: false,
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

  describe("parseConfigFile", () => {
    test("normal config does not change", async () => {
      expect(
        await parseConfigFile({
          ...blankCliConf,
        }),
      ).toEqual(blankCliConf)
    })
    describe("appendData", () => {
      test("appends", async () => {
        const result = await parseConfigFile({
          ...blankCliConf,
          appendData: { key: "value" },
        })
        expect(result?.data?.key).toEqual("value")
      })
      test("overwrites existing value", async () => {
        const result = await parseConfigFile({
          ...blankCliConf,
          data: { num: "123" },
          appendData: { num: "1234" },
        })
        expect(result?.data?.num).toEqual("1234")
      })
    })
  })

  describe("getConfig", () => {
    test("gets git config", async () => {
      const resultFn = await config.getRemoteConfig({
        git: "https://github.com/chenasraf/simple-scaffold.git",
        logLevel: LogLevel.none,
      })
      const result = await resolve(resultFn, blankCliConf)
      expect(result).toEqual(blankCliConf)
    })

    test("gets local file config", async () => {
      const resultFn = await config.getLocalConfig({
        config: "scaffold.config.js",
        logLevel: LogLevel.none,
      })
      const result = await resolve(resultFn, {} as any)
      expect(result).toEqual(configFile)
    })
  })
})
