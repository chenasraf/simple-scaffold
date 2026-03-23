import { describe, test, expect, beforeEach, afterEach } from "vitest"
import mockFs from "mock-fs"
import { Console } from "console"
import { validateConfig, validateTemplatePaths, assertConfigValid } from "../src/validate"

const validConfig = {
  name: "test",
  templates: ["templates"],
  output: "output",
}

describe("validate", () => {
  describe("validateConfig", () => {
    test("returns no errors for valid config", () => {
      expect(validateConfig(validConfig)).toEqual([])
    })

    test("returns no errors with all optional fields", () => {
      const errors = validateConfig({
        ...validConfig,
        subdir: true,
        subdirHelper: "camelCase",
        data: { key: "value" },
        logLevel: "debug",
        dryRun: true,
        overwrite: true,
        inputs: {
          author: { type: "text", message: "Author", required: true },
        },
      })
      expect(errors).toEqual([])
    })

    test("errors on missing name", () => {
      const errors = validateConfig({ ...validConfig, name: "" })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("name")
    })

    test("errors on missing templates", () => {
      const errors = validateConfig({ ...validConfig, templates: [] })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("templates")
    })

    test("errors on invalid logLevel", () => {
      const errors = validateConfig({ ...validConfig, logLevel: "verbose" })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("logLevel")
    })

    test("errors on subdirHelper without subdir", () => {
      const errors = validateConfig({
        ...validConfig,
        subdirHelper: "camelCase",
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain("subdirHelper")
    })

    test("no error on subdirHelper with subdir", () => {
      const errors = validateConfig({
        ...validConfig,
        subdir: true,
        subdirHelper: "camelCase",
      })
      expect(errors).toEqual([])
    })

    test("errors on select input without options", () => {
      const errors = validateConfig({
        ...validConfig,
        inputs: {
          license: { type: "select" },
        },
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes("select") && e.includes("options"))).toBe(true)
    })

    test("no error on select input with options", () => {
      const errors = validateConfig({
        ...validConfig,
        inputs: {
          license: { type: "select", options: ["MIT", "Apache"] },
        },
      })
      expect(errors).toEqual([])
    })

    test("errors on confirm input with non-boolean default", () => {
      const errors = validateConfig({
        ...validConfig,
        inputs: {
          flag: { type: "confirm", default: "yes" },
        },
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes("confirm") && e.includes("boolean"))).toBe(true)
    })

    test("errors on number input with non-number default", () => {
      const errors = validateConfig({
        ...validConfig,
        inputs: {
          port: { type: "number", default: "3000" },
        },
      })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes("number"))).toBe(true)
    })

    test("valid input types pass", () => {
      const errors = validateConfig({
        ...validConfig,
        inputs: {
          a: { type: "text", required: true },
          b: { type: "select", options: ["x", "y"] },
          c: { type: "confirm", default: false },
          d: { type: "number", default: 42 },
        },
      })
      expect(errors).toEqual([])
    })

    test("accepts function output", () => {
      const errors = validateConfig({
        ...validConfig,
        output: () => "dynamic-output",
      })
      expect(errors).toEqual([])
    })

    test("accepts function overwrite", () => {
      const errors = validateConfig({
        ...validConfig,
        overwrite: () => true,
      })
      expect(errors).toEqual([])
    })

    test("accepts afterScaffold string", () => {
      const errors = validateConfig({
        ...validConfig,
        afterScaffold: "npm install",
      })
      expect(errors).toEqual([])
    })

    test("accepts afterScaffold function", () => {
      const errors = validateConfig({
        ...validConfig,
        afterScaffold: () => {},
      })
      expect(errors).toEqual([])
    })
  })

  describe("validateTemplatePaths", () => {
    beforeEach(() => {
      console = new Console(process.stdout, process.stderr)
      mockFs({
        templates: { "file.txt": "content" },
      })
    })

    afterEach(() => {
      mockFs.restore()
    })

    test("returns no errors for existing paths", async () => {
      const errors = await validateTemplatePaths(["templates"])
      expect(errors).toEqual([])
    })

    test("returns error for missing paths", async () => {
      const errors = await validateTemplatePaths(["nonexistent"])
      expect(errors.length).toBe(1)
      expect(errors[0]).toContain("nonexistent")
    })

    test("skips glob patterns", async () => {
      const errors = await validateTemplatePaths(["templates/**/*"])
      expect(errors).toEqual([])
    })

    test("skips negation patterns", async () => {
      const errors = await validateTemplatePaths(["!excluded"])
      expect(errors).toEqual([])
    })
  })

  describe("assertConfigValid", () => {
    beforeEach(() => {
      console = new Console(process.stdout, process.stderr)
      mockFs({
        templates: { "file.txt": "content" },
      })
    })

    afterEach(() => {
      mockFs.restore()
    })

    test("does not throw for valid config", async () => {
      await expect(assertConfigValid(validConfig)).resolves.toBeUndefined()
    })

    test("throws formatted error for invalid config", async () => {
      await expect(assertConfigValid({ name: "", templates: [], output: "" })).rejects.toThrow(
        "Invalid scaffold config",
      )
    })

    test("includes all errors in message", async () => {
      try {
        await assertConfigValid({ name: "", templates: [], output: "out" })
      } catch (e) {
        const msg = (e as Error).message
        expect(msg).toContain("name")
        expect(msg).toContain("templates")
      }
    })

    test("checks template path existence", async () => {
      await expect(
        assertConfigValid({ name: "test", templates: ["missing"], output: "out" }),
      ).rejects.toThrow("does not exist")
    })
  })
})
