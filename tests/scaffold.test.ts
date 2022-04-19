import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import Scaffold from "../src/scaffold"
import { readdirSync, readFileSync } from "fs"
import { Console } from "console"
import { defaultHelpers } from "../src/utils"
import { join } from "path"
import * as dateFns from "date-fns"

const fileStructNormal = {
  input: {
    "{{name}}.txt": "Hello, my app is {{name}}",
  },
  output: {},
}

const fileStructWithData = {
  input: {
    "{{name}}.txt": "Hello, my value is {{value}}",
  },
  output: {},
}

const fileStructNested = {
  input: {
    "{{name}}-1.txt": "This should be in root",
    "{{Name}}": {
      "{{name}}-2.txt": "Hello, my value is {{value}}",
      moreNesting: {
        "{{name}}-3.txt": "Hi! My value is actually NOT {{value}}!",
      },
    },
  },
  output: {},
}
const fileStructSubdirTransformer = {
  input: {
    "{{name}}.txt": "Hello, my app is {{name}}",
  },
  output: {},
}

const defaultHelperNames = Object.keys(defaultHelpers)
const fileStructHelpers = {
  input: {
    defaults: defaultHelperNames.reduce<Record<string, string>>(
      (all, cur) => ({ ...all, [cur + ".txt"]: `{{ ${cur} name }}` }),
      {}
    ),
    custom: {
      "add1.txt": "{{ add1 name }}",
    },
  },
  output: {},
}

const fileStructDates = {
  input: {
    "now.txt": "Today is {{ now 'mmm' }}, time is {{ now 'HH:mm' }}",
    "offset.txt": "Yesterday was {{ now 'mmm' -1 'days' }}, time is {{ now 'HH:mm' -1 'days' }}",
    "custom.txt": "Custom date is {{ date customDate 'mmm' }}, time is {{ date customDate 'HH:mm' }}",
  },
  output: {},
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

describe("Scaffold", () => {
  describe(
    "create subfolder",
    withMock(fileStructNormal, () => {
      test("should not create by default", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
        })
        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should create with config", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          createSubFolder: true,
          verbose: 0,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    })
  )

  describe(
    "overwrite",
    withMock(fileStructWithData, () => {
      test("should not overwrite by default", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "1" },
          verbose: 0,
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          verbose: 0,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my value is 1")
      })

      test("should overwrite with config", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "1" },
          verbose: 0,
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          overwrite: true,
          verbose: 0,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my value is 2")
      })
    })
  )

  describe(
    "errors",
    withMock(fileStructNormal, () => {
      let consoleMock1: jest.SpyInstance
      beforeAll(() => {
        consoleMock1 = jest.spyOn(console, "error").mockImplementation(() => void 0)
      })

      afterAll(() => {
        consoleMock1.mockRestore()
      })

      test("should throw for bad input", async () => {
        await expect(
          Scaffold({
            name: "app_name",
            output: "output",
            templates: ["non-existing-input"],
            data: { value: "1" },
            verbose: 0,
          })
        ).rejects.toThrow()

        expect(() => readFileSync(join(process.cwd(), "output", "app_name.txt"))).toThrow()
      })
    })
  )

  describe(
    "dry run",
    withMock(fileStructNormal, () => {
      let consoleMock1: jest.SpyInstance
      beforeAll(() => {
        consoleMock1 = jest.spyOn(console, "error").mockImplementation(() => void 0)
      })

      afterAll(() => {
        consoleMock1.mockRestore()
      })

      test("should not write to disk", async () => {
        Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "1" },
          verbose: 0,
          dryRun: true,
        })

        expect(() => readFileSync(join(process.cwd(), "output", "app_name.txt"))).toThrow()
      })
    })
  )

  describe(
    "outputPath override",
    withMock(fileStructNormal, () => {
      test("should allow override function", async () => {
        await Scaffold({
          name: "app_name",
          output: (fullPath, basedir, basename) => join("custom-output", `${basename.split(".")[0]}`),
          templates: ["input"],
          data: { value: "1" },
          verbose: 0,
        })
        const data = readFileSync(join(process.cwd(), "/custom-output/app_name/app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    })
  )

  describe(
    "output structure",
    withMock(fileStructNested, () => {
      test("should maintain input structure on output", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "1" },
          verbose: 0,
        })

        const rootDir = readdirSync(join(process.cwd(), "output"))
        const dir = readdirSync(join(process.cwd(), "output", "AppName"))
        const nestedDir = readdirSync(join(process.cwd(), "output", "AppName", "moreNesting"))
        expect(rootDir).toHaveProperty("length")
        expect(dir).toHaveProperty("length")
        expect(nestedDir).toHaveProperty("length")

        const rootFile = readFileSync(join(process.cwd(), "output", "app_name-1.txt"))
        const oneDeepFile = readFileSync(join(process.cwd(), "output", "AppName/app_name-2.txt"))
        const twoDeepFile = readFileSync(join(process.cwd(), "output", "AppName/moreNesting/app_name-3.txt"))
        expect(rootFile.toString()).toEqual("This should be in root")
        expect(oneDeepFile.toString()).toEqual("Hello, my value is 1")
        expect(twoDeepFile.toString()).toEqual("Hi! My value is actually NOT 1!")
      })
    })
  )

  describe(
    "capitalization helpers",
    withMock(fileStructHelpers, () => {
      const _helpers: Record<string, (text: string) => string> = {
        add1: (text) => text + " 1",
      }

      test("should work", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          helpers: _helpers,
        })

        const results = {
          camelCase: "appName",
          snakeCase: "app_name",
          startCase: "App Name",
          kebabCase: "app-name",
          hyphenCase: "app-name",
          pascalCase: "AppName",
          lowerCase: "app_name",
          upperCase: "APP_NAME",
        }
        for (const key in results) {
          const file = readFileSync(join(process.cwd(), "output", "defaults", `${key}.txt`))
          expect(file.toString()).toEqual(results[key as keyof typeof results])
        }
      })
    })
  )
  describe(
    "date helpers",
    withMock(fileStructDates, () => {
      test("should work", async () => {
        const now = new Date()
        const yesterday = dateFns.add(new Date(), { days: -1 })
        const customDate = dateFns.formatISO(dateFns.add(new Date(), { days: -1 }))

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          data: { customDate },
        })

        const nowFile = readFileSync(join(process.cwd(), "output", "now.txt"))
        const offsetFile = readFileSync(join(process.cwd(), "output", "offset.txt"))
        const customFile = readFileSync(join(process.cwd(), "output", "custom.txt"))

        // "now.txt": "Today is {{ now 'mmm' }}, time is {{ now 'HH:mm' }}",
        // "offset.txt": "Yesterday was {{ now 'mmm' -1 'days' }}, time is {{ now 'HH:mm' -1 'days' }}",
        // "custom.txt": "Custom date is {{ date customDate 'mmm' }}, time is {{ date customDate 'HH:mm' }}",

        expect(nowFile.toString()).toEqual(
          `Today is ${dateFns.format(now, "mmm")}, time is ${dateFns.format(now, "HH:mm")}`
        )
        expect(offsetFile.toString()).toEqual(
          `Yesterday was ${dateFns.format(yesterday, "mmm")}, time is ${dateFns.format(yesterday, "HH:mm")}`
        )
        expect(customFile.toString()).toEqual(
          `Custom date is ${dateFns.format(dateFns.parseISO(customDate), "mmm")}, time is ${dateFns.format(
            dateFns.parseISO(customDate),
            "HH:mm"
          )}`
        )
      })
    })
  )
  describe(
    "custom helpers",
    withMock(fileStructHelpers, () => {
      const _helpers: Record<string, (text: string) => string> = {
        add1: (text) => text + " 1",
      }
      test("should work", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          helpers: _helpers,
        })

        const results = {
          add1: "app_name 1",
        }
        for (const key in results) {
          const file = readFileSync(join(process.cwd(), "output", "custom", `${key}.txt`))
          expect(file.toString()).toEqual(results[key as keyof typeof results])
        }
      })
    })
  )
  describe(
    "transform subfolder",
    withMock(fileStructSubdirTransformer, () => {
      test("should work with no helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          createSubFolder: true,
          verbose: 0,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should work with default helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          createSubFolder: true,
          verbose: 0,
          subFolderNameHelper: "upperCase",
        })

        const data = readFileSync(join(process.cwd(), "output", "APP_NAME", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should work with custom helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          createSubFolder: true,
          verbose: 0,
          subFolderNameHelper: "test",
          helpers: {
            test: () => "REPLACED",
          },
        })

        const data = readFileSync(join(process.cwd(), "output", "REPLACED", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    })
  )
  describe(
    "before write",
    withMock(fileStructNormal, () => {
      test("should work with no callback", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          data: {
            value: "value",
          },
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should work with custom callback", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          data: {
            value: "value",
          },
          beforeWrite: (content, beforeContent, outputPath) =>
            [content.toString().toUpperCase(), beforeContent, outputPath].join(", "),
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual(
          [
            "Hello, my app is app_name".toUpperCase(),
            fileStructNormal.input["{{name}}.txt"],
            join(process.cwd(), "output", "app_name.txt"),
          ].join(", ")
        )
      })
      test("should work with undefined response custom callback", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          verbose: 0,
          data: {
            value: "value",
          },
          beforeWrite: () => undefined,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    })
  )
})
