import { describe, test, expect, beforeEach, afterEach, beforeAll, vi } from "vitest"
import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import { Console } from "console"
import { LogLevel, ScaffoldCmdConfig, ScaffoldConfig } from "../src/types"
import * as config from "../src/config"
import { resolve } from "../src/utils"
import configFile from "./test-config"
import { findConfigFile, getOptionValueForFile } from "../src/config"
import { registerHelpers } from "../src/parser"
import path from "path"

vi.mock("../src/git", async () => {
  const actual = await vi.importActual<typeof import("../src/git")>("../src/git")
  return {
    ...actual,
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
      expect(parseAppendData('key="value test"', blankCliConf)).toEqual({
        key: "value test",
        name: "test",
      })
    })

    test("handles JSON array values with :=", () => {
      expect(parseAppendData('items:=["a","b"]', blankCliConf)).toEqual({
        items: ["a", "b"],
        name: "test",
      })
    })

    test("handles JSON boolean with :=", () => {
      expect(parseAppendData("flag:=true", blankCliConf)).toEqual({ flag: true, name: "test" })
      expect(parseAppendData("flag:=false", blankCliConf)).toEqual({ flag: false, name: "test" })
    })

    test("handles JSON null with :=", () => {
      expect(parseAppendData("val:=null", blankCliConf)).toEqual({ val: null, name: "test" })
    })

    test("handles JSON object with :=", () => {
      expect(parseAppendData('obj:={"a":1}', blankCliConf)).toEqual({ obj: { a: 1 }, name: "test" })
    })

    test("handles single quoted values", () => {
      expect(parseAppendData("key='value test'", blankCliConf)).toEqual({
        key: "value test",
        name: "test",
      })
    })

    test("handles empty string value", () => {
      expect(parseAppendData("key=", blankCliConf)).toEqual({ key: "", name: "test" })
    })

    test("handles negative number with :=", () => {
      expect(parseAppendData("num:=-42", blankCliConf)).toEqual({ num: -42, name: "test" })
    })

    test("handles float with :=", () => {
      expect(parseAppendData("num:=3.14", blankCliConf)).toEqual({ num: 3.14, name: "test" })
    })
  })

  describe("githubPartToUrl", () => {
    test("works", () => {
      expect(githubPartToUrl("chenasraf/simple-scaffold")).toEqual(
        "https://github.com/chenasraf/simple-scaffold.git",
      )
      expect(githubPartToUrl("chenasraf/simple-scaffold.git")).toEqual(
        "https://github.com/chenasraf/simple-scaffold.git",
      )
    })

    test("handles organization repos", () => {
      expect(githubPartToUrl("org/sub-repo")).toEqual("https://github.com/org/sub-repo.git")
    })

    test("handles repos with dots in name", () => {
      expect(githubPartToUrl("user/my.repo")).toEqual("https://github.com/user/my.repo.git")
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

    test("throws when name is missing", async () => {
      await expect(
        parseConfigFile({
          ...blankCliConf,
          name: "",
          tmpDir: `/tmp/scaffold-config-${Date.now()}`,
        }),
      ).rejects.toThrow("Missing required option: name")
    })

    test("preserves dryRun setting", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        dryRun: true,
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.dryRun).toBe(true)
    })

    test("preserves subdir setting", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        subdir: true,
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.subdir).toBe(true)
    })

    test("preserves overwrite setting", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        overwrite: true,
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.overwrite).toBe(true)
    })

    test("merges data from config and appendData", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        data: { key1: "val1" },
        appendData: { key2: "val2" },
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.data).toEqual({ key1: "val1", key2: "val2" })
    })

    test("appendData overrides data", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        data: { key: "original" },
        appendData: { key: "overridden" },
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.data?.key).toEqual("overridden")
    })

    test("sets subdirHelper from config", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        subdirHelper: "pascalCase",
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.subdirHelper).toEqual("pascalCase")
    })

    test("handles empty templates array", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "test",
        templates: [],
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.templates).toEqual([])
    })

    test("throws when config key not found", async () => {
      await expect(
        parseConfigFile({
          ...blankCliConf,
          name: "test",
          config: path.resolve(__dirname, "test-config.js"),
          key: "nonexistent",
          tmpDir: `/tmp/scaffold-config-${Date.now()}`,
        }),
      ).rejects.toThrow('Template "nonexistent" not found')
    })

    test("uses default key when key not specified", async () => {
      const result = await parseConfigFile({
        ...blankCliConf,
        name: "MyComponent",
        templates: undefined as unknown as string[],
        config: path.resolve(__dirname, "test-config.js"),
        tmpDir: `/tmp/scaffold-config-${Date.now()}`,
      })
      expect(result.templates.length).toBeGreaterThan(0)
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

  describe("getRemoteConfig", () => {
    test("throws for unsupported protocol", async () => {
      await expect(
        config.getRemoteConfig({
          git: "ftp://example.com/repo.git",
          logLevel: LogLevel.none,
          tmpDir: `/tmp/scaffold-config-${Date.now()}`,
        }),
      ).rejects.toThrow("Unsupported protocol")
    })
  })

  describe("getOptionValueForFile", () => {
    const conf: ScaffoldConfig = {
      name: "test",
      output: "output",
      templates: [],
      logLevel: LogLevel.none,
      data: { name: "test" },
    }

    beforeAll(() => {
      registerHelpers(conf)
    })

    test("returns static string value", () => {
      expect(getOptionValueForFile(conf, "/some/path", "static-value")).toEqual("static-value")
    })

    test("returns static boolean value", () => {
      expect(getOptionValueForFile(conf, "/some/path", true)).toBe(true)
      expect(getOptionValueForFile(conf, "/some/path", false)).toBe(false)
    })

    test("calls function with file path info", () => {
      const fn = vi.fn().mockReturnValue("custom-output")
      const result = getOptionValueForFile(conf, "/home/user/file.txt", fn)
      expect(result).toEqual("custom-output")
      expect(fn).toHaveBeenCalledWith("/home/user/file.txt", expect.any(String), expect.any(String))
    })

    test("returns default value when fn is not a function and no value", () => {
      expect(
        getOptionValueForFile(conf, "/some/path", undefined as unknown as string, "default"),
      ).toEqual("default")
    })

    test("function receives parsed basename", () => {
      const fn = (_fullPath: string, _basedir: string, basename: string) => basename
      const result = getOptionValueForFile(conf, "/home/user/{{name}}.txt", fn)
      expect(result).toEqual("test.txt")
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

    function withMock(fileStruct: FileSystem.DirectoryItems, testFn: () => void): () => void {
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

      describe(
        `finds config file ${k}`,
        withMock(struct, () => {
          test(`finds ${k}`, async () => {
            const result = await findConfigFile(process.cwd())
            expect(result).toEqual(k)
          })
        }),
      )
    }

    describe(
      "finds .mjs config file",
      withMock({ "scaffold.config.mjs": "export default {}" }, () => {
        test("finds scaffold.config.mjs", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.config.mjs")
        })
      }),
    )

    describe(
      "priority order",
      withMock(
        {
          "scaffold.config.js": "module.exports = {}",
          "scaffold.js": "module.exports = {}",
        },
        () => {
          test("prefers scaffold.config.js over scaffold.js", async () => {
            const result = await findConfigFile(process.cwd())
            expect(result).toEqual("scaffold.config.js")
          })
        },
      ),
    )

    describe(
      "throws when no config found",
      withMock({ "unrelated-file.txt": "content" }, () => {
        test("throws error when no config file exists", async () => {
          await expect(findConfigFile(process.cwd())).rejects.toThrow("Could not find config file")
        })
      }),
    )

    describe(
      "finds scaffold.config.cjs",
      withMock({ "scaffold.config.cjs": "module.exports = {}" }, () => {
        test("finds .cjs config file", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.config.cjs")
        })
      }),
    )

    describe(
      "finds scaffold.config.json",
      withMock({ "scaffold.config.json": "{}" }, () => {
        test("finds .json config file", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.config.json")
        })
      }),
    )

    describe(
      "finds scaffold.mjs",
      withMock({ "scaffold.mjs": "export default {}" }, () => {
        test("finds scaffold.mjs", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.mjs")
        })
      }),
    )

    describe(
      "finds scaffold.cjs",
      withMock({ "scaffold.cjs": "module.exports = {}" }, () => {
        test("finds scaffold.cjs", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.cjs")
        })
      }),
    )

    describe(
      "finds scaffold.json",
      withMock({ "scaffold.json": "{}" }, () => {
        test("finds scaffold.json", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual("scaffold.json")
        })
      }),
    )

    describe(
      "finds .scaffold.js",
      withMock({ ".scaffold.js": "module.exports = {}" }, () => {
        test("finds dotfile config", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual(".scaffold.js")
        })
      }),
    )

    describe(
      "finds .scaffold.json",
      withMock({ ".scaffold.json": "{}" }, () => {
        test("finds dotfile json config", async () => {
          const result = await findConfigFile(process.cwd())
          expect(result).toEqual(".scaffold.json")
        })
      }),
    )

    describe(
      "prefers scaffold.config over .scaffold",
      withMock(
        {
          "scaffold.config.js": "module.exports = {}",
          ".scaffold.js": "module.exports = {}",
        },
        () => {
          test("prefers scaffold.config.js over .scaffold.js", async () => {
            const result = await findConfigFile(process.cwd())
            expect(result).toEqual("scaffold.config.js")
          })
        },
      ),
    )

    describe(
      "prefers scaffold over .scaffold",
      withMock(
        {
          "scaffold.js": "module.exports = {}",
          ".scaffold.js": "module.exports = {}",
        },
        () => {
          test("prefers scaffold.js over .scaffold.js", async () => {
            const result = await findConfigFile(process.cwd())
            expect(result).toEqual("scaffold.js")
          })
        },
      ),
    )
  })
})
