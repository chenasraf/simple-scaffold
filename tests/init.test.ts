import { describe, test, expect, vi, beforeEach, afterEach } from "vitest"
import mockFs from "mock-fs"
import { Console } from "console"
import { readFileSync, existsSync } from "fs"
import path from "path"

vi.mock("@inquirer/input", () => ({
  default: vi.fn(),
}))

vi.mock("@inquirer/select", () => ({
  default: vi.fn(),
}))

import selectMock from "@inquirer/select"
import { initScaffold } from "../src/init"

describe("init", () => {
  beforeEach(() => {
    console = new Console(process.stdout, process.stderr)
    vi.clearAllMocks()
    mockFs({})
  })

  afterEach(() => {
    mockFs.restore()
  })

  test("creates js config and example template", async () => {
    await initScaffold({ format: "js", dir: process.cwd() })

    expect(existsSync("scaffold.config.js")).toBe(true)
    const config = readFileSync("scaffold.config.js", "utf-8")
    expect(config).toContain("module.exports")
    expect(config).toContain("templates/default")

    expect(existsSync(path.join("templates", "default", "{{name}}.md"))).toBe(true)
    const template = readFileSync(path.join("templates", "default", "{{name}}.md"), "utf-8")
    expect(template).toContain("{{ name }}")
  })

  test("creates mjs config", async () => {
    await initScaffold({ format: "mjs", dir: process.cwd() })

    expect(existsSync("scaffold.config.mjs")).toBe(true)
    const config = readFileSync("scaffold.config.mjs", "utf-8")
    expect(config).toContain("export default")
  })

  test("creates json config", async () => {
    await initScaffold({ format: "json", dir: process.cwd() })

    expect(existsSync("scaffold.config.json")).toBe(true)
    const config = readFileSync("scaffold.config.json", "utf-8")
    const parsed = JSON.parse(config)
    expect(parsed.default).toBeDefined()
    expect(parsed.default.templates).toEqual(["templates/default"])
  })

  test("does not overwrite existing config", async () => {
    mockFs.restore()
    mockFs({
      "scaffold.config.js": "// existing config",
    })

    await initScaffold({ format: "js", dir: process.cwd() })

    const config = readFileSync("scaffold.config.js", "utf-8")
    expect(config).toBe("// existing config")
  })

  test("does not overwrite existing template dir", async () => {
    mockFs.restore()
    mockFs({
      templates: {
        default: {
          "existing.md": "# Existing",
        },
      },
    })

    await initScaffold({ format: "js", dir: process.cwd() })

    expect(existsSync(path.join("templates", "default", "existing.md"))).toBe(true)
    expect(existsSync(path.join("templates", "default", "{{name}}.md"))).toBe(false)
  })

  test("skips example template when createExample is false", async () => {
    await initScaffold({ format: "js", dir: process.cwd(), createExample: false })

    expect(existsSync("scaffold.config.js")).toBe(true)
    expect(existsSync("templates")).toBe(false)
  })

  test("prompts for format when not provided", async () => {
    vi.mocked(selectMock).mockResolvedValue("js")

    await initScaffold({ dir: process.cwd() })

    expect(selectMock).toHaveBeenCalledOnce()
    expect(existsSync("scaffold.config.js")).toBe(true)
  })

  test("creates config in custom directory", async () => {
    mockFs.restore()
    mockFs({
      "my-project": {},
    })

    await initScaffold({ format: "js", dir: path.resolve("my-project") })

    expect(existsSync(path.join("my-project", "scaffold.config.js"))).toBe(true)
    expect(existsSync(path.join("my-project", "templates", "default", "{{name}}.md"))).toBe(true)
  })
})
