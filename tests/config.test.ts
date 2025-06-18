import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import { Console } from "console"
import { LogLevel, ScaffoldCmdConfig } from "../src/types"
import * as config from "../src/config"
import { resolve } from "../src/utils"
import configFile from "./test-config"
import { findConfigFile } from "../src/config"
import path from "path"

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
  subdir: false,
  dryRun: false,
  quiet: false,
  version: false,
}

const blankConfig: ScaffoldCmdConfig = {
  ...blankCliConf,
  data: {},
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
      const tmpDir = `/tmp/scaffold-config-${Date.now()}`
      const { quiet: _, tmpDir: _tmpDir, version: __, ...conf } = blankCliConf
      expect(
        await parseConfigFile({
          ...blankCliConf,
          name: "-",
          tmpDir,
        }),
      ).toEqual({ ...conf, name: "-", tmpDir, subdirHelper: undefined, beforeWrite: undefined })
    })

    describe("appendData", () => {
      test("appends", async () => {
        const result = await parseConfigFile({
          ...blankCliConf,
          name: "-",
          appendData: { key: "value" },
          tmpDir: `/tmp/scaffold-config-${Date.now()}`,
        })
        expect(result?.data?.key).toEqual("value")
      })

      test("overwrites existing value", async () => {
        const result = await parseConfigFile({
          ...blankCliConf,
          name: "-",
          data: { num: "123" },
          appendData: { num: "1234" },
          tmpDir: `/tmp/scaffold-config-${Date.now()}`,
        })
        expect(result?.data?.num).toEqual("1234")
      })

      test("CLI output overrides config file output", async () => {
        const tmpDir = `/tmp/scaffold-config-${Date.now()}`

        const result = await parseConfigFile({
          ...blankCliConf,
          config: path.resolve(__dirname, "test-config.js"),
          key: "component",
          output: "examples/test-output/override",
          name: "Component",
          tmpDir,
        })

        expect(result.output).toEqual("examples/test-output/override")
      })
    })
  })

  describe("getConfig", () => {
    test("gets git config", async () => {
      const resultFn = await config.getRemoteConfig({
        git: "https://github.com/chenasraf/simple-scaffold.git",
        logLevel: LogLevel.none,
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      const result = await resolve(resultFn, blankCliConf)
      expect(result).toEqual(blankCliConf)
    })

    test("gets local file config", async () => {
      const resultFn = await config.getLocalConfig({
        config: path.join(__dirname, "test-config.js"),
        logLevel: LogLevel.none,
      })
      const result = (await resolve(resultFn, {} as ScaffoldCmdConfig)).default
      expect(result).toEqual(configFile)
    })
  })

  describe("findConfigFile", () => {
    const struct1 = {
      "scaffold.config.js": `module.exports = '${JSON.stringify(blankConfig)}'`,
    }
    const struct2 = {
      "scaffold.js": `module.exports = '${JSON.stringify(blankConfig)}'`,
    }
    const struct3 = {
      "scaffold.cjs": `module.exports = '${JSON.stringify(blankConfig)}'`,
    }
    const struct4 = {
      "scaffold.json": JSON.stringify(blankConfig),
    }

    function withMock(fileStruct: FileSystem.DirectoryItems, testFn: jest.EmptyFunction): jest.EmptyFunction {
      return () => {
        beforeEach(() => {
          // console.log("Mocking:", fileStruct)
          console = new Console(process.stdout, process.stderr)

          mockFs(fileStruct)
          // logMock = jest.spyOn(console, 'log').mockImplementation((...args) => {
          //   logsTemp.push(args)
          // })
        })
        testFn()
        afterEach(() => {
          // console.log("Restoring mock")
          mockFs.restore()
        })
      }
    }

    for (const struct of [struct1, struct2, struct3, struct4]) {
      const [k] = Object.keys(struct)

      describe(`finds config file ${k}`, () => {
        withMock(struct, async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual(k)
        })
      })
    }
  })
})
