import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import Scaffold from "../src/scaffold"
import { readdirSync, readFileSync } from "fs"

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
    "{{name}}-1.text": "This should be in root",
    "{{Name}}": {
      "{{name}}-2.txt": "Hello, my value is {{value}}",
    },
  },
  output: {},
}

function withMock(fileStruct: FileSystem.DirectoryItems, testFn: jest.EmptyFunction): jest.EmptyFunction {
  return () => {
    beforeEach(() => {
      mockFs(fileStruct)
    })
    testFn()
    afterEach(() => {
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
          quiet: true,
        })

        const data = readFileSync(process.cwd() + "/output/app_name.txt")
        expect(data.toString()).toBe("Hello, my app is app_name")
      })

      test("should create with config", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          createSubFolder: true,
          quiet: true,
        })

        const data = readFileSync(process.cwd() + "/output/app_name/app_name.txt")
        expect(data.toString()).toBe("Hello, my app is app_name")
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
          quiet: true,
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          quiet: true,
        })

        const data = readFileSync(process.cwd() + "/output/app_name.txt")
        expect(data.toString()).toBe("Hello, my value is 1")
      })

      test("should overwrite with config", async () => {
        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "1" },
          quiet: true,
        })

        await Scaffold({
          name: "app_name",
          output: "output",
          templates: ["input"],
          data: { value: "2" },
          overwrite: true,
          quiet: true,
        })

        const data = readFileSync(process.cwd() + "/output/app_name.txt")
        expect(data.toString()).toBe("Hello, my value is 2")
      })
    })
  )

  describe(
    "errors",
    withMock(fileStructNormal, () => {
      let consoleMock: jest.SpyInstance
      beforeAll(() => {
        consoleMock = jest.spyOn(console, "error").mockImplementation(() => void 0)
      })

      test("should throw for bad input", async () => {
        await expect(
          Scaffold({
            name: "app_name",
            output: "output",
            templates: ["non-existing-input"],
            data: { value: "1" },
            quiet: true,
          })
        ).rejects.toThrow()

        expect(() => readFileSync(process.cwd() + "/output/app_name.txt")).toThrow()
      })

      afterAll(() => {
        consoleMock.mockRestore()
      })
    })
  )

  describe(
    "outputPath override",
    withMock(fileStructNormal, () => {
      test("should allow override function", async () => {
        await Scaffold({
          name: "app_name",
          output: (fullPath, basedir, basename) => `custom-output/${basename.split(".")[0]}`,
          templates: ["input"],
          data: { value: "1" },
          quiet: true,
        })
        const data = readFileSync(process.cwd() + "/custom-output/app_name/app_name.txt")
        expect(data.toString()).toBe("Hello, my app is app_name")
      })
    })
  )

  describe(
    "output structure",
    withMock(fileStructNested, () => {
      test("should maintain input structure on output", async () => {
        await Scaffold({
          name: "app_name",
          output: "./",
          templates: ["input"],
          data: { value: "1" },
          quiet: true,
        })

        const dir = readdirSync(process.cwd())
        expect(dir).toHaveProperty("length")
      })
    })
  )
})
