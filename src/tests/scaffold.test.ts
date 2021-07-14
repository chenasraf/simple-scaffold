import mockFs from "mock-fs"
import Scaffold from "../scaffold"
import { readFileSync } from "fs"

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

describe("Scaffold", () => {
  describe("create subfolder", () => {
    beforeAll(() => {
      mockFs.restore()
      mockFs(fileStructNormal)
    })

    test("should not create by default", async () => {
      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        silent: true,
      })

      const data = readFileSync(process.cwd() + "/output/app_name.txt")
      expect(data.toString()).toBe("Hello, my app is app_name")
    })

    test("should create with config", async () => {
      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        createSubfolder: true,
        silent: true,
      })

      const data = readFileSync(process.cwd() + "/output/app_name/app_name.txt")
      expect(data.toString()).toBe("Hello, my app is app_name")
    })

    afterAll(() => mockFs.restore())
  })

  describe("overwrite", () => {
    beforeAll(() => {
      mockFs.restore()
      mockFs(fileStructWithData)
    })

    test("should not overwrite by default", async () => {
      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        data: { value: "1" },
        silent: true,
      })

      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        data: { value: "2" },
        silent: true,
      })

      const data = readFileSync(process.cwd() + "/output/app_name.txt")
      expect(data.toString()).toBe("Hello, my value is 1")
    })

    test("should overwrite with config", async () => {
      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        data: { value: "1" },
        silent: true,
      })

      await Scaffold({
        name: "app_name",
        outputPath: "output",
        templates: ["input"],
        data: { value: "2" },
        overwrite: true,
        silent: true,
      })

      const data = readFileSync(process.cwd() + "/output/app_name.txt")
      expect(data.toString()).toBe("Hello, my value is 2")
    })

    afterAll(() => mockFs.restore())
  })

  describe("errors", () => {
    let mock: jest.SpyInstance
    beforeAll(() => {
      mock = jest.spyOn(console, "error").mockImplementation(() => void 0)
      mockFs.restore()
      mockFs(fileStructNormal)
    })

    test("should throw for bad input", async () => {
      await expect(
        Scaffold({
          name: "app_name",
          outputPath: "output",
          templates: ["non-existing-input"],
          data: { value: "1" },
          silent: true,
        })
      ).rejects.toThrow()

      expect(() => readFileSync(process.cwd() + "/output/app_name.txt")).toThrow()
    })

    afterAll(() => {
      mockFs.restore()
      mock.mockRestore()
    })
  })

  describe("outputPath override", () => {
    beforeAll(() => {
      mockFs.restore()
      mockFs(fileStructNormal)
    })

    test("should allow override function", async () => {
      await Scaffold({
        name: "app_name",
        outputPath: (fullPath, basedir, basename) => `custom-output/${basename.split(".")[0]}`,
        templates: ["input"],
        data: { value: "1" },
        silent: true,
      })
      const data = readFileSync(process.cwd() + "/custom-output/app_name/app_name.txt")
      expect(data.toString()).toBe("Hello, my app is app_name")
    })

    afterAll(() => {
      mockFs.restore()
    })
  })
})
