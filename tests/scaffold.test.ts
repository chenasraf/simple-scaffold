import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi, type MockInstance } from "vitest"
import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import Scaffold from "../src/scaffold"
import { readdirSync, readFileSync } from "fs"
import { Console } from "console"
import { defaultHelpers } from "../src/parser"
import { join } from "path"
import * as dateFns from "date-fns"
import crypto from "crypto"

const fileStructNormal = {
  input: {
    "{{name}}.txt": "Hello, my app is {{name}}",
  },
  output: {},
}
const fileStructWithBinary = {
  input: {
    "{{name}}.txt": "Hello, my app is {{name}}",
    "{{name}}.bin": crypto.randomBytes(10000),
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
    "{{pascalCase name}}": {
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
      {},
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

const fileStructExcludes = {
  input: {
    "include.txt": "This file should be included",
    "exclude.txt": "This file should be excluded",
  },
  output: {},
}

function withMock(fileStruct: FileSystem.DirectoryItems, testFn: () => void): () => void {
  return () => {
    beforeEach(() => {
      // console.log("Mocking:", fileStruct)
      console = new Console(process.stdout, process.stderr)

      mockFs(fileStruct)
      // logMock = vi.spyOn(console, 'log').mockImplementation((...args) => {
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
    "create subdir",

    withMock(fileStructNormal, () => {
      test("should not create by default", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
        })
        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should create with config", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          subdir: true,
          logLevel: "none",
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    }),
  )

  describe(
    "binary files",

    withMock(fileStructWithBinary, () => {
      test("should copy as-is", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
        })
        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
        const dataBin = readFileSync(join(process.cwd(), "output", "app_name.bin"))
        expect(dataBin).toEqual(fileStructWithBinary.input["{{name}}.bin"])
      })
    }),
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
          logLevel: "none",
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          logLevel: "none",
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
          logLevel: "none",
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          overwrite: true,
          logLevel: "none",
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my value is 2")
      })
    }),
  )

  describe(
    "errors",
    withMock(fileStructNormal, () => {
      let consoleMock1: MockInstance
      beforeAll(() => {
        consoleMock1 = vi.spyOn(console, "error").mockImplementation(() => void 0)
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
            logLevel: "none",
          }),
        ).rejects.toThrow()

        await expect(
          Scaffold({
            name: "app_name",
            output: "output",
            templates: ["non-existing-input/non-existing-file.txt"],
            data: { value: "1" },
            logLevel: "none",
          }),
        ).rejects.toThrow()

        expect(() => readFileSync(join(process.cwd(), "output", "app_name.txt"))).toThrow()
      })
    }),
  )

  describe(
    "dry run",
    withMock(fileStructNormal, () => {
      let consoleMock1: MockInstance
      beforeAll(() => {
        consoleMock1 = vi.spyOn(console, "error").mockImplementation(() => void 0)
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
          logLevel: "none",
          dryRun: true,
        })

        expect(() => readFileSync(join(process.cwd(), "output", "app_name.txt"))).toThrow()
      })
    }),
  )

  describe(
    "outputPath override",
    withMock(fileStructNormal, () => {
      test("should allow override function", async () => {
        await Scaffold({
          name: "app_name",
          output: (_, __, basename) => join("custom-output", `${basename.split(".")[0]}`),
          templates: ["input"],
          data: { value: "1" },
          logLevel: "none",
        })
        const data = readFileSync(join(process.cwd(), "/custom-output/app_name/app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    }),
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
          logLevel: "none",
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
    }),
  )

  describe(
    "file exclusion via glob pattern",
    withMock(fileStructExcludes, () => {
      test("should only include matching files", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input/include.*"],
          data: { value: "1" },
          logLevel: "none",
        })
        const outputFiles = readdirSync(join(process.cwd(), "output"))
        expect(outputFiles).toContain("include.txt")
        expect(outputFiles).not.toContain("exclude.txt")
      })
    }),
  )

  describe(
    "capitalization helpers",
    withMock(fileStructHelpers, () => {
      const _helpers: Record<string, (_text: string) => string> = {
        add1: (text) => text + " 1",
      }

      test("should work", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
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
    }),
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
          logLevel: "none",
          data: { customDate },
        })

        const nowFile = readFileSync(join(process.cwd(), "output", "now.txt"))
        const offsetFile = readFileSync(join(process.cwd(), "output", "offset.txt"))
        const customFile = readFileSync(join(process.cwd(), "output", "custom.txt"))

        // "now.txt": "Today is {{ now 'mmm' }}, time is {{ now 'HH:mm' }}",
        // "offset.txt": "Yesterday was {{ now 'mmm' -1 'days' }}, time is {{ now 'HH:mm' -1 'days' }}",
        // "custom.txt": "Custom date is {{ date customDate 'mmm' }}, time is {{ date customDate 'HH:mm' }}",

        expect(nowFile.toString()).toEqual(
          `Today is ${dateFns.format(now, "mmm")}, time is ${dateFns.format(now, "HH:mm")}`,
        )
        expect(offsetFile.toString()).toEqual(
          `Yesterday was ${dateFns.format(yesterday, "mmm")}, time is ${dateFns.format(yesterday, "HH:mm")}`,
        )
        expect(customFile.toString()).toEqual(
          `Custom date is ${dateFns.format(dateFns.parseISO(customDate), "mmm")}, time is ${dateFns.format(
            dateFns.parseISO(customDate),
            "HH:mm",
          )}`,
        )
      })
    }),
  )
  describe(
    "custom helpers",
    withMock(fileStructHelpers, () => {
      const _helpers: Record<string, (_text: string) => string> = {
        add1: (text) => text + " 1",
      }
      test("should work", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
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
    }),
  )
  describe(
    "transform subdir",
    withMock(fileStructSubdirTransformer, () => {
      test("should work with no helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          subdir: true,
          logLevel: "none",
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should work with default helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          subdir: true,
          logLevel: "none",
          subdirHelper: "upperCase",
        })

        const data = readFileSync(join(process.cwd(), "output", "APP_NAME", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })

      test("should work with custom helper", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          subdir: true,
          logLevel: "none",
          subdirHelper: "test",
          helpers: {
            test: () => "REPLACED",
          },
        })

        const data = readFileSync(join(process.cwd(), "output", "REPLACED", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    }),
  )
  describe(
    "before write",
    withMock(fileStructNormal, () => {
      test("should work with no callback", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
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
          logLevel: "none",
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
          ].join(", "),
        )
      })
      test("should work with undefined response custom callback", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          logLevel: "none",
          data: {
            value: "value",
          },
          beforeWrite: () => undefined,
        })

        const data = readFileSync(join(process.cwd(), "output", "app_name.txt"))
        expect(data.toString()).toEqual("Hello, my app is app_name")
      })
    }),
  )

  describe(
    "name is available in data",
    withMock(
      {
        input: { "file.txt": "Name: {{name}}" },
        output: {},
      },
      () => {
        test("name is automatically injected into data", async () => {
          await Scaffold({
            name: "my_project",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("Name: my_project")
        })
      },
    ),
  )

  describe(
    "data overrides name in data",
    withMock(
      {
        input: { "file.txt": "Name: {{name}}" },
        output: {},
      },
      () => {
        test("explicit data.name takes precedence", async () => {
          await Scaffold({
            name: "original_name",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            data: { name: "custom_name" },
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("Name: custom_name")
        })
      },
    ),
  )

  describe(
    "multiple templates",
    withMock(
      {
        template1: { "file1.txt": "From template 1: {{name}}" },
        template2: { "file2.txt": "From template 2: {{name}}" },
        output: {},
      },
      () => {
        test("processes multiple template directories", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["template1", "template2"],
            logLevel: "none",
          })
          const file1 = readFileSync(join(process.cwd(), "output", "file1.txt")).toString()
          const file2 = readFileSync(join(process.cwd(), "output", "file2.txt")).toString()
          expect(file1).toEqual("From template 1: app")
          expect(file2).toEqual("From template 2: app")
        })
      },
    ),
  )

  describe(
    "template with custom data",
    withMock(
      {
        input: { "{{name}}.txt": "Author: {{author}}, Version: {{version}}" },
        output: {},
      },
      () => {
        test("uses custom data in content and filename", async () => {
          await Scaffold({
            name: "my_app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            data: { author: "John", version: "2.0" },
          })
          const content = readFileSync(join(process.cwd(), "output", "my_app.txt")).toString()
          expect(content).toEqual("Author: John, Version: 2.0")
        })
      },
    ),
  )

  describe(
    "template with helpers in filenames",
    withMock(
      {
        input: { "{{pascalCase name}}.tsx": "component {{pascalCase name}}" },
        output: {},
      },
      () => {
        test("applies helpers to filenames", async () => {
          await Scaffold({
            name: "my_component",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          const content = readFileSync(join(process.cwd(), "output", "MyComponent.tsx")).toString()
          expect(content).toEqual("component MyComponent")
        })
      },
    ),
  )

  describe(
    "template with helpers in directory names",
    withMock(
      {
        input: {
          "{{kebabCase name}}": {
            "index.ts": "export from {{name}}",
          },
        },
        output: {},
      },
      () => {
        test("applies helpers to directory names", async () => {
          await Scaffold({
            name: "MyComponent",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          const content = readFileSync(join(process.cwd(), "output", "my-component", "index.ts")).toString()
          expect(content).toEqual("export from MyComponent")
        })
      },
    ),
  )

  describe(
    "deeply nested template structure",
    withMock(
      {
        input: {
          "root.txt": "root",
          level1: {
            "l1.txt": "level 1",
            level2: {
              "l2.txt": "level 2",
              level3: {
                "l3.txt": "level 3 {{name}}",
              },
            },
          },
        },
        output: {},
      },
      () => {
        test("preserves deep nesting", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          expect(readFileSync(join(process.cwd(), "output", "root.txt")).toString()).toEqual("root")
          expect(readFileSync(join(process.cwd(), "output", "level1", "l1.txt")).toString()).toEqual("level 1")
          expect(
            readFileSync(join(process.cwd(), "output", "level1", "level2", "l2.txt")).toString(),
          ).toEqual("level 2")
          expect(
            readFileSync(
              join(process.cwd(), "output", "level1", "level2", "level3", "l3.txt"),
            ).toString(),
          ).toEqual("level 3 app")
        })
      },
    ),
  )

  describe(
    "overwrite as function",
    withMock(
      {
        input: {
          "keep.txt": "new keep",
          "replace.txt": "new replace",
        },
        output: {
          "keep.txt": "old keep",
          "replace.txt": "old replace",
        },
      },
      () => {
        test("per-file overwrite control", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            overwrite: (_fullPath, _basedir, basename) => basename === "replace.txt",
          })
          expect(readFileSync(join(process.cwd(), "output", "keep.txt")).toString()).toEqual("old keep")
          expect(readFileSync(join(process.cwd(), "output", "replace.txt")).toString()).toEqual("new replace")
        })
      },
    ),
  )

  describe(
    "multiple custom helpers",
    withMock(
      {
        input: {
          "file.txt": "{{reverse name}} - {{repeat name}}",
        },
        output: {},
      },
      () => {
        test("multiple custom helpers work together", async () => {
          await Scaffold({
            name: "abc",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            helpers: {
              reverse: (text: string) => text.split("").reverse().join(""),
              repeat: (text: string) => text + text,
            },
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("cba - abcabc")
        })
      },
    ),
  )

  describe(
    "subdirHelper with different helpers",
    withMock(
      {
        input: { "file.txt": "content" },
        output: {},
      },
      () => {
        test("subdirHelper camelCase", async () => {
          await Scaffold({
            name: "my_component",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            subdir: true,
            subdirHelper: "camelCase",
          })
          const content = readFileSync(join(process.cwd(), "output", "myComponent", "file.txt")).toString()
          expect(content).toEqual("content")
        })

        test("subdirHelper kebabCase", async () => {
          await Scaffold({
            name: "MyComponent",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            subdir: true,
            subdirHelper: "kebabCase",
          })
          const content = readFileSync(join(process.cwd(), "output", "my-component", "file.txt")).toString()
          expect(content).toEqual("content")
        })

        test("subdirHelper snakeCase", async () => {
          await Scaffold({
            name: "MyComponent",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            subdir: true,
            subdirHelper: "snakeCase",
          })
          const content = readFileSync(join(process.cwd(), "output", "my_component", "file.txt")).toString()
          expect(content).toEqual("content")
        })
      },
    ),
  )

  describe(
    "empty template directory",
    withMock(
      {
        input: {},
        output: {},
      },
      () => {
        test("handles empty template dir gracefully", async () => {
          await expect(
            Scaffold({
              name: "app",
              output: "output",
              templates: ["input"],
              logLevel: "none",
            }),
          ).resolves.toBeUndefined()
        })
      },
    ),
  )

  describe(
    "template with special characters in data",
    withMock(
      {
        input: { "file.txt": "Value: {{value}}" },
        output: {},
      },
      () => {
        test("handles special characters in data values", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            data: { value: "hello & <world> \"test\"" },
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("Value: hello & <world> \"test\"")
        })
      },
    ),
  )

  describe(
    "beforeWrite with async callback",
    withMock(
      {
        input: { "file.txt": "Hello {{name}}" },
        output: {},
      },
      () => {
        test("supports async beforeWrite", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            beforeWrite: async (content) => {
              return content.toString().replace("Hello", "Hi")
            },
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("Hi app")
        })
      },
    ),
  )

  describe(
    "beforeWrite receives all arguments",
    withMock(
      {
        input: { "{{name}}.txt": "Template: {{name}}" },
        output: {},
      },
      () => {
        test("beforeWrite gets content, rawContent, and outputPath", async () => {
          const beforeWriteSpy = vi.fn().mockReturnValue(undefined)
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            beforeWrite: beforeWriteSpy,
          })
          expect(beforeWriteSpy).toHaveBeenCalledTimes(1)
          const [content, rawContent, outputPath] = beforeWriteSpy.mock.calls[0]
          expect(content.toString()).toEqual("Template: app")
          expect(rawContent.toString()).toEqual("Template: {{name}}")
          expect(outputPath).toContain("app.txt")
        })
      },
    ),
  )

  describe(
    "multiple binary files",
    withMock(
      {
        input: {
          "img1.bin": crypto.randomBytes(5000),
          "img2.bin": crypto.randomBytes(8000),
          "text.txt": "regular text {{name}}",
        },
        output: {},
      },
      () => {
        test("handles mix of binary and text files", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          const text = readFileSync(join(process.cwd(), "output", "text.txt")).toString()
          expect(text).toEqual("regular text app")
          const bin1 = readFileSync(join(process.cwd(), "output", "img1.bin"))
          const bin2 = readFileSync(join(process.cwd(), "output", "img2.bin"))
          expect(bin1.length).toBeGreaterThan(0)
          expect(bin2.length).toBeGreaterThan(0)
        })
      },
    ),
  )

  describe(
    "output with function returning dynamic path",
    withMock(
      {
        input: {
          "component.tsx": "component {{name}}",
          "style.css": "style for {{name}}",
        },
        output: {},
      },
      () => {
        test("output function can route files to different directories", async () => {
          await Scaffold({
            name: "Button",
            output: (_fullPath, _basedir, basename) => {
              if (basename.endsWith(".css")) return join("output", "styles")
              return join("output", "components")
            },
            templates: ["input"],
            logLevel: "none",
          })
          const component = readFileSync(
            join(process.cwd(), "output", "components", "component.tsx"),
          ).toString()
          const style = readFileSync(
            join(process.cwd(), "output", "styles", "style.css"),
          ).toString()
          expect(component).toEqual("component Button")
          expect(style).toEqual("style for Button")
        })
      },
    ),
  )

  describe(
    "handlebars block helpers",
    withMock(
      {
        input: {
          "file.txt": "{{#if showHeader}}Header\n{{/if}}Body for {{name}}",
        },
        output: {},
      },
      () => {
        test("supports handlebars block helpers in templates", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
            data: { showHeader: true },
          })
          const content = readFileSync(join(process.cwd(), "output", "file.txt")).toString()
          expect(content).toEqual("Header\nBody for app")
        })
      },
    ),
  )

  describe(
    "glob pattern as template",
    withMock(
      {
        src: {
          "file1.txt": "text 1 {{name}}",
          "file2.txt": "text 2 {{name}}",
          "file3.js": "js {{name}}",
        },
        output: {},
      },
      () => {
        test("glob pattern selects matching files only", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["src/*.txt"],
            logLevel: "none",
          })
          // glob templates maintain structure relative to the non-glob part
          const outputFiles = readdirSync(join(process.cwd(), "output", "src"))
          expect(outputFiles).toContain("file1.txt")
          expect(outputFiles).toContain("file2.txt")
          expect(outputFiles).not.toContain("file3.js")
        })
      },
    ),
  )

  describe(
    "dotfiles in template",
    withMock(
      {
        input: {
          ".gitignore": "node_modules",
          ".env.example": "KEY={{name}}",
        },
        output: {},
      },
      () => {
        test("includes dotfiles in output", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          expect(readFileSync(join(process.cwd(), "output", ".gitignore")).toString()).toEqual("node_modules")
          expect(readFileSync(join(process.cwd(), "output", ".env.example")).toString()).toEqual("KEY=app")
        })
      },
    ),
  )

  describe(
    "large number of files",
    withMock(
      {
        input: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`file${i}.txt`, `Content ${i} for {{name}}`]),
        ),
        output: {},
      },
      () => {
        test("handles many files", async () => {
          await Scaffold({
            name: "app",
            output: "output",
            templates: ["input"],
            logLevel: "none",
          })
          const files = readdirSync(join(process.cwd(), "output"))
          expect(files.length).toBe(50)
          expect(readFileSync(join(process.cwd(), "output", "file0.txt")).toString()).toEqual("Content 0 for app")
          expect(readFileSync(join(process.cwd(), "output", "file49.txt")).toString()).toEqual("Content 49 for app")
        })
      },
    ),
  )
})
