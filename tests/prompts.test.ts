import { describe, test, expect, vi, beforeEach } from "vitest"
import { LogLevel, ScaffoldCmdConfig, ScaffoldConfig } from "../src/types"

vi.mock("@inquirer/input", () => ({
  default: vi.fn(),
}))

vi.mock("@inquirer/select", () => ({
  default: vi.fn(),
}))

import inputMock from "@inquirer/input"
import selectMock from "@inquirer/select"
import {
  promptForName,
  promptForTemplateKey,
  promptForOutput,
  promptForTemplates,
  promptForMissingConfig,
  promptForInputs,
  resolveInputs,
  isInteractive,
} from "../src/prompts"

function mockTTY(value: boolean) {
  Object.defineProperty(process.stdin, "isTTY", { value, configurable: true })
}

const blankConfig: ScaffoldCmdConfig = {
  logLevel: LogLevel.none,
  name: "",
  output: "",
  templates: [],
  data: {},
  overwrite: false,
  subdir: false,
  dryRun: false,
  quiet: false,
  version: false,
}

describe("prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("promptForName", () => {
    test("calls input prompt and returns result", async () => {
      vi.mocked(inputMock).mockResolvedValue("my-component")
      const result = await promptForName()
      expect(result).toEqual("my-component")
      expect(inputMock).toHaveBeenCalledOnce()
    })
  })

  describe("promptForTemplateKey", () => {
    test("calls select prompt when multiple keys", async () => {
      vi.mocked(selectMock).mockResolvedValue("component")
      const result = await promptForTemplateKey({
        default: { name: "d", templates: [], output: "" },
        component: { name: "c", templates: [], output: "" },
      })
      expect(result).toEqual("component")
      expect(selectMock).toHaveBeenCalledOnce()
    })

    test("returns single key without prompting", async () => {
      const result = await promptForTemplateKey({
        default: { name: "d", templates: [], output: "" },
      })
      expect(result).toEqual("default")
      expect(selectMock).not.toHaveBeenCalled()
    })

    test("throws when config map is empty", async () => {
      await expect(promptForTemplateKey({})).rejects.toThrow("No templates found")
    })

    test("presents all keys as choices", async () => {
      vi.mocked(selectMock).mockResolvedValue("b")
      await promptForTemplateKey({
        a: { name: "a", templates: [], output: "" },
        b: { name: "b", templates: [], output: "" },
        c: { name: "c", templates: [], output: "" },
      })
      const call = vi.mocked(selectMock).mock.calls[0][0] as { choices: { name: string; value: string }[] }
      expect(call.choices).toEqual([
        { name: "a", value: "a" },
        { name: "b", value: "b" },
        { name: "c", value: "c" },
      ])
    })
  })

  describe("promptForOutput", () => {
    test("calls input prompt and returns result", async () => {
      vi.mocked(inputMock).mockResolvedValue("./dist")
      const result = await promptForOutput()
      expect(result).toEqual("./dist")
      expect(inputMock).toHaveBeenCalledOnce()
    })
  })

  describe("promptForTemplates", () => {
    test("parses comma-separated input into array", async () => {
      vi.mocked(inputMock).mockResolvedValue("src/templates, lib/other")
      const result = await promptForTemplates()
      expect(result).toEqual(["src/templates", "lib/other"])
    })

    test("handles single template", async () => {
      vi.mocked(inputMock).mockResolvedValue("src/templates")
      const result = await promptForTemplates()
      expect(result).toEqual(["src/templates"])
    })

    test("trims whitespace and filters empty entries", async () => {
      vi.mocked(inputMock).mockResolvedValue("  a , , b  ,  ")
      const result = await promptForTemplates()
      expect(result).toEqual(["a", "b"])
    })
  })

  describe("isInteractive", () => {
    test("returns a boolean", () => {
      expect(typeof isInteractive()).toBe("boolean")
    })
  })

  describe("promptForMissingConfig", () => {
    test("prompts for all missing values when interactive", async () => {
      mockTTY(true)
      vi.mocked(inputMock)
        .mockResolvedValueOnce("my-app")      // name
        .mockResolvedValueOnce("./output")     // output
        .mockResolvedValueOnce("src/tpl")      // templates

      const config = { ...blankConfig }
      const result = await promptForMissingConfig(config)
      expect(result.name).toEqual("my-app")
      expect(result.output).toEqual("./output")
      expect(result.templates).toEqual(["src/tpl"])
      expect(inputMock).toHaveBeenCalledTimes(3)
    })

    test("does not prompt for values already provided", async () => {
      mockTTY(true)

      const config = {
        ...blankConfig,
        name: "already-set",
        output: "./out",
        templates: ["tpl"],
      }
      const result = await promptForMissingConfig(config)
      expect(result.name).toEqual("already-set")
      expect(result.output).toEqual("./out")
      expect(result.templates).toEqual(["tpl"])
      expect(inputMock).not.toHaveBeenCalled()
    })

    test("prompts for template key when multiple templates and no key", async () => {
      mockTTY(true)
      vi.mocked(inputMock)
        .mockResolvedValueOnce("name")         // name
        .mockResolvedValueOnce("./output")     // output
        .mockResolvedValueOnce("src/tpl")      // templates
      vi.mocked(selectMock).mockResolvedValue("component")

      const configMap = {
        default: { name: "d", templates: [], output: "" },
        component: { name: "c", templates: [], output: "" },
      }
      const config = { ...blankConfig }
      const result = await promptForMissingConfig(config, configMap)
      expect(result.key).toEqual("component")
    })

    test("does not prompt for template key when already set", async () => {
      mockTTY(true)

      const configMap = {
        default: { name: "d", templates: [], output: "" },
        component: { name: "c", templates: [], output: "" },
      }
      const config = { ...blankConfig, name: "test", output: "./out", templates: ["tpl"], key: "default" }
      const result = await promptForMissingConfig(config, configMap)
      expect(result.key).toEqual("default")
      expect(selectMock).not.toHaveBeenCalled()
    })

    test("does not prompt for template key when only one template", async () => {
      mockTTY(true)

      const configMap = {
        default: { name: "d", templates: [], output: "" },
      }
      const config = { ...blankConfig, name: "test", output: "./out", templates: ["tpl"] }
      const result = await promptForMissingConfig(config, configMap)
      expect(result.key).toBeUndefined()
      expect(selectMock).not.toHaveBeenCalled()
    })

    test("does not prompt in non-interactive mode", async () => {
      mockTTY(false)

      const config = { ...blankConfig }
      const result = await promptForMissingConfig(config)
      expect(result.name).toEqual("")
      expect(result.output).toEqual("")
      expect(result.templates).toEqual([])
      expect(inputMock).not.toHaveBeenCalled()
    })

    test("does not prompt for config key when no config map provided", async () => {
      mockTTY(true)
      vi.mocked(inputMock)
        .mockResolvedValueOnce("name")
        .mockResolvedValueOnce("./out")
        .mockResolvedValueOnce("tpl")

      const config = { ...blankConfig }
      const result = await promptForMissingConfig(config)
      expect(result.key).toBeUndefined()
      expect(selectMock).not.toHaveBeenCalled()
    })

    test("only prompts for missing values, not provided ones", async () => {
      mockTTY(true)
      vi.mocked(inputMock).mockResolvedValueOnce("src/tpl")  // only templates missing

      const config = { ...blankConfig, name: "app", output: "./out" }
      const result = await promptForMissingConfig(config)
      expect(result.name).toEqual("app")
      expect(result.output).toEqual("./out")
      expect(result.templates).toEqual(["src/tpl"])
      expect(inputMock).toHaveBeenCalledOnce()
    })
  })

  describe("promptForInputs", () => {
    test("prompts for required inputs not in existing data", async () => {
      vi.mocked(inputMock).mockResolvedValueOnce("John")
      const result = await promptForInputs(
        { author: { message: "Author name", required: true } },
        {},
      )
      expect(result.author).toEqual("John")
      expect(inputMock).toHaveBeenCalledOnce()
    })

    test("skips inputs already provided in data", async () => {
      const result = await promptForInputs(
        { author: { message: "Author name", required: true } },
        { author: "Jane" },
      )
      expect(result.author).toEqual("Jane")
      expect(inputMock).not.toHaveBeenCalled()
    })

    test("applies default value for optional inputs not in data", async () => {
      const result = await promptForInputs(
        { license: { default: "MIT" } },
        {},
      )
      expect(result.license).toEqual("MIT")
      expect(inputMock).not.toHaveBeenCalled()
    })

    test("does not apply default when value already exists", async () => {
      const result = await promptForInputs(
        { license: { default: "MIT" } },
        { license: "Apache-2.0" },
      )
      expect(result.license).toEqual("Apache-2.0")
    })

    test("uses input key as message fallback", async () => {
      vi.mocked(inputMock).mockResolvedValueOnce("val")
      await promptForInputs(
        { myField: { required: true } },
        {},
      )
      const call = vi.mocked(inputMock).mock.calls[0][0] as { message: string }
      expect(call.message).toContain("myField")
    })

    test("prompts multiple required inputs in order", async () => {
      vi.mocked(inputMock)
        .mockResolvedValueOnce("John")
        .mockResolvedValueOnce("2.0")
      const result = await promptForInputs(
        {
          author: { message: "Author", required: true },
          version: { message: "Version", required: true },
        },
        {},
      )
      expect(result.author).toEqual("John")
      expect(result.version).toEqual("2.0")
      expect(inputMock).toHaveBeenCalledTimes(2)
    })

    test("mixes prompts, defaults, and existing data", async () => {
      vi.mocked(inputMock).mockResolvedValueOnce("John")
      const result = await promptForInputs(
        {
          author: { message: "Author", required: true },
          license: { default: "MIT" },
          description: { message: "Desc", required: true },
        },
        { description: "My project" },
      )
      expect(result.author).toEqual("John")
      expect(result.license).toEqual("MIT")
      expect(result.description).toEqual("My project")
      expect(inputMock).toHaveBeenCalledOnce()
    })

    test("preserves existing data keys not in inputs", async () => {
      const result = await promptForInputs(
        { license: { default: "MIT" } },
        { extra: "value" },
      )
      expect(result.extra).toEqual("value")
      expect(result.license).toEqual("MIT")
    })

    test("required input with default pre-fills prompt", async () => {
      vi.mocked(inputMock).mockResolvedValueOnce("custom")
      await promptForInputs(
        { author: { required: true, default: "Anonymous" } },
        {},
      )
      const call = vi.mocked(inputMock).mock.calls[0][0] as { default?: string }
      expect(call.default).toEqual("Anonymous")
    })
  })

  describe("resolveInputs", () => {
    test("returns config unchanged when no inputs defined", async () => {
      const config: ScaffoldConfig = {
        name: "test",
        output: "out",
        templates: [],
        data: { foo: "bar" },
      }
      const result = await resolveInputs(config)
      expect(result.data).toEqual({ foo: "bar" })
    })

    test("applies defaults in non-interactive mode", async () => {
      mockTTY(false)
      const config: ScaffoldConfig = {
        name: "test",
        output: "out",
        templates: [],
        data: {},
        inputs: {
          license: { default: "MIT" },
        },
      }
      const result = await resolveInputs(config)
      expect(result.data?.license).toEqual("MIT")
      expect(inputMock).not.toHaveBeenCalled()
    })

    test("does not overwrite existing data with defaults in non-interactive mode", async () => {
      mockTTY(false)
      const config: ScaffoldConfig = {
        name: "test",
        output: "out",
        templates: [],
        data: { license: "Apache-2.0" },
        inputs: {
          license: { default: "MIT" },
        },
      }
      const result = await resolveInputs(config)
      expect(result.data?.license).toEqual("Apache-2.0")
    })

    test("prompts for required inputs in interactive mode", async () => {
      mockTTY(true)
      vi.mocked(inputMock).mockResolvedValueOnce("John")
      const config: ScaffoldConfig = {
        name: "test",
        output: "out",
        templates: [],
        data: {},
        inputs: {
          author: { message: "Author", required: true },
        },
      }
      const result = await resolveInputs(config)
      expect(result.data?.author).toEqual("John")
    })
  })
})
