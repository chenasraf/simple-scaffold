import { describe, test, expect, beforeEach, afterEach } from "vitest"
import mockFs from "mock-fs"
import FileSystem from "mock-fs/lib/filesystem"
import { Console } from "console"
import path from "node:path"
import {
  removeGlob,
  makeRelativePath,
  getBasePath,
  getOutputDir,
  getUniqueTmpPath,
  pathExists,
  createDirIfNotExists,
  getTemplateGlobInfo,
  getTemplateFileInfo,
  copyFileTransformed,
  handleTemplateFile,
  getFileList,
} from "../src/file"
import { ScaffoldConfig, LogLevel } from "../src/types"
import { registerHelpers } from "../src/parser"
import { readFileSync } from "fs"

function withMock(fileStruct: FileSystem.DirectoryItems, testFn: () => void): () => void {
  return () => {
    beforeEach(() => {
      console = new Console(process.stdout, process.stderr)
      mockFs(fileStruct)
    })
    testFn()
    afterEach(() => {
      mockFs.restore()
    })
  }
}

const baseConfig: ScaffoldConfig = {
  name: "test_app",
  output: "output",
  templates: ["input"],
  logLevel: LogLevel.none,
  data: { name: "test_app" },
  tmpDir: ".",
}

describe("file utilities", () => {
  describe("removeGlob", () => {
    test("removes single wildcard", () => {
      expect(removeGlob("input/*")).toEqual(path.normalize("input/"))
    })

    test("removes double wildcard", () => {
      expect(removeGlob("input/**/*")).toEqual(path.normalize("input///"))
    })

    test("returns path unchanged when no glob", () => {
      expect(removeGlob("input/file.txt")).toEqual(path.normalize("input/file.txt"))
    })

    test("removes wildcards from nested path", () => {
      expect(removeGlob("a/b/*/c/**")).toEqual(path.normalize("a/b//c//"))
    })

    test("handles empty string", () => {
      expect(removeGlob("")).toEqual(".")
    })
  })

  describe("makeRelativePath", () => {
    test("removes leading separator", () => {
      expect(makeRelativePath(path.sep + "some/path")).toEqual("some/path")
    })

    test("returns path unchanged if no leading separator", () => {
      expect(makeRelativePath("some/path")).toEqual("some/path")
    })

    test("handles empty string", () => {
      expect(makeRelativePath("")).toEqual("")
    })

    test("removes only the first separator", () => {
      expect(makeRelativePath(path.sep + "a" + path.sep + "b")).toEqual("a" + path.sep + "b")
    })
  })

  describe("getBasePath", () => {
    test("resolves relative path against cwd", () => {
      const result = getBasePath("some/path")
      expect(result).toEqual("some/path")
    })

    test("handles empty string", () => {
      const result = getBasePath("")
      expect(result).toEqual("")
    })

    test("handles current directory", () => {
      const result = getBasePath(".")
      expect(result).toEqual("")
    })
  })

  describe("getOutputDir", () => {
    test("returns output path without subdir", () => {
      const config: ScaffoldConfig = { ...baseConfig, subdir: false }
      registerHelpers(config)
      const result = getOutputDir(config, "output", "")
      expect(result).toEqual(path.resolve(process.cwd(), "output"))
    })

    test("returns output path with subdir", () => {
      const config: ScaffoldConfig = { ...baseConfig, subdir: true }
      registerHelpers(config)
      const result = getOutputDir(config, "output", "")
      expect(result).toEqual(path.resolve(process.cwd(), "output", "test_app"))
    })

    test("applies subdirHelper to subdir name", () => {
      const config: ScaffoldConfig = {
        ...baseConfig,
        subdir: true,
        subdirHelper: "pascalCase",
      }
      registerHelpers(config)
      const result = getOutputDir(config, "output", "")
      expect(result).toEqual(path.resolve(process.cwd(), "output", "TestApp"))
    })

    test("includes basePath in output", () => {
      const config: ScaffoldConfig = { ...baseConfig, subdir: false }
      registerHelpers(config)
      const result = getOutputDir(config, "output", "nested/dir")
      expect(result).toEqual(path.resolve(process.cwd(), "output", "nested/dir"))
    })

    test("combines output, basePath, and subdir", () => {
      const config: ScaffoldConfig = { ...baseConfig, subdir: true }
      registerHelpers(config)
      const result = getOutputDir(config, "output", "nested")
      expect(result).toEqual(path.resolve(process.cwd(), "output", "nested", "test_app"))
    })
  })

  describe("getUniqueTmpPath", () => {
    test("returns a path in os temp directory", () => {
      const result = getUniqueTmpPath()
      const os = require("os")
      expect(result.startsWith(os.tmpdir())).toBe(true)
    })

    test("includes scaffold-config prefix", () => {
      const result = getUniqueTmpPath()
      expect(path.basename(result)).toMatch(/^scaffold-config-/)
    })

    test("generates unique paths", () => {
      const a = getUniqueTmpPath()
      const b = getUniqueTmpPath()
      expect(a).not.toEqual(b)
    })
  })

  describe(
    "pathExists",
    withMock(
      {
        "existing-file.txt": "content",
        "existing-dir": {},
      },
      () => {
        test("returns true for existing file", async () => {
          expect(await pathExists("existing-file.txt")).toBe(true)
        })

        test("returns true for existing directory", async () => {
          expect(await pathExists("existing-dir")).toBe(true)
        })

        test("returns false for non-existing path", async () => {
          expect(await pathExists("non-existing")).toBe(false)
        })
      },
    ),
  )

  describe(
    "createDirIfNotExists",
    withMock({}, () => {
      test("creates directory", async () => {
        await createDirIfNotExists("new-dir", { logLevel: LogLevel.none, dryRun: false })
        expect(await pathExists("new-dir")).toBe(true)
      })

      test("creates nested directories recursively", async () => {
        await createDirIfNotExists("a/b/c", { logLevel: LogLevel.none, dryRun: false })
        expect(await pathExists("a/b/c")).toBe(true)
      })

      test("does not create directory in dry run mode", async () => {
        await createDirIfNotExists("dry-dir", { logLevel: LogLevel.none, dryRun: true })
        expect(await pathExists("dry-dir")).toBe(false)
      })

      test("does not throw if directory already exists", async () => {
        await createDirIfNotExists("existing", { logLevel: LogLevel.none, dryRun: false })
        await expect(
          createDirIfNotExists("existing", { logLevel: LogLevel.none, dryRun: false }),
        ).resolves.toBeUndefined()
      })
    }),
  )

  describe(
    "getTemplateGlobInfo",
    withMock(
      {
        "template-dir": {
          "file1.txt": "content1",
          "file2.txt": "content2",
        },
        "single-file.txt": "content",
      },
      () => {
        test("detects directory template", async () => {
          const result = await getTemplateGlobInfo(baseConfig, "template-dir")
          expect(result.isDirOrGlob).toBe(true)
          expect(result.isGlob).toBe(false)
          expect(result.template).toEqual(path.join("template-dir", "**", "*"))
        })

        test("detects glob template", async () => {
          const result = await getTemplateGlobInfo(baseConfig, "template-dir/**/*.txt")
          expect(result.isDirOrGlob).toBe(true)
          expect(result.isGlob).toBe(true)
        })

        test("preserves non-glob single file", async () => {
          const result = await getTemplateGlobInfo(baseConfig, "single-file.txt")
          expect(result.isDirOrGlob).toBe(false)
          expect(result.isGlob).toBe(false)
          expect(result.template).toEqual("single-file.txt")
        })

        test("stores original template", async () => {
          const result = await getTemplateGlobInfo(baseConfig, "template-dir")
          expect(result.origTemplate).toEqual("template-dir")
        })
      },
    ),
  )

  describe(
    "getFileList",
    withMock(
      {
        templates: {
          "file1.txt": "content1",
          "file2.js": "content2",
          ".hidden": "hidden content",
          nested: {
            "file3.txt": "content3",
          },
        },
      },
      () => {
        test("lists all files with glob", async () => {
          const files = await getFileList(baseConfig, ["templates/**/*"])
          expect(files.length).toBe(4)
        })

        test("includes dotfiles", async () => {
          const files = await getFileList(baseConfig, ["templates/**/*"])
          expect(files.some((f) => f.includes(".hidden"))).toBe(true)
        })

        test("filters by extension", async () => {
          const files = await getFileList(baseConfig, ["templates/**/*.txt"])
          expect(files.length).toBe(2)
          expect(files.every((f) => f.endsWith(".txt"))).toBe(true)
        })

        test("supports exclusion patterns", async () => {
          const files = await getFileList(baseConfig, ["templates/**/*.txt"])
          expect(files.some((f) => f.includes(".hidden"))).toBe(false)
          expect(files.every((f) => f.endsWith(".txt"))).toBe(true)
        })
      },
    ),
  )

  describe(
    "getTemplateFileInfo",
    withMock(
      {
        input: {
          "{{name}}.txt": "Hello {{name}}",
        },
        output: {},
      },
      () => {
        test("calculates correct output path", async () => {
          const config: ScaffoldConfig = { ...baseConfig, tmpDir: "." }
          registerHelpers(config)
          const info = await getTemplateFileInfo(config, {
            templatePath: "input/{{name}}.txt",
            basePath: "",
          })
          expect(info.inputPath).toEqual(path.resolve(process.cwd(), "input/{{name}}.txt"))
          expect(info.outputPath).toContain("test_app.txt")
          expect(info.exists).toBe(false)
        })

        test("detects existing output file", async () => {
          mockFs.restore()
          mockFs({
            input: { "{{name}}.txt": "Hello {{name}}" },
            output: { "test_app.txt": "existing" },
          })
          const config: ScaffoldConfig = { ...baseConfig, tmpDir: "." }
          registerHelpers(config)
          const info = await getTemplateFileInfo(config, {
            templatePath: "input/{{name}}.txt",
            basePath: "",
          })
          expect(info.exists).toBe(true)
        })
      },
    ),
  )

  describe(
    "copyFileTransformed",
    withMock(
      {
        "input.txt": "Hello {{name}}",
        output: {},
      },
      () => {
        test("writes transformed content", async () => {
          const config: ScaffoldConfig = { ...baseConfig }
          registerHelpers(config)
          await createDirIfNotExists("output", { logLevel: LogLevel.none, dryRun: false })
          await copyFileTransformed(config, {
            exists: false,
            overwrite: false,
            outputPath: "output/result.txt",
            inputPath: "input.txt",
          })
          const content = readFileSync("output/result.txt").toString()
          expect(content).toEqual("Hello test_app")
        })

        test("does not write in dry run mode", async () => {
          const config: ScaffoldConfig = { ...baseConfig, dryRun: true }
          registerHelpers(config)
          await copyFileTransformed(config, {
            exists: false,
            overwrite: false,
            outputPath: "output/result.txt",
            inputPath: "input.txt",
          })
          expect(await pathExists("output/result.txt")).toBe(false)
        })

        test("skips existing file without overwrite", async () => {
          mockFs.restore()
          mockFs({
            "input.txt": "Hello {{name}}",
            output: { "result.txt": "original" },
          })
          const config: ScaffoldConfig = { ...baseConfig }
          registerHelpers(config)
          await copyFileTransformed(config, {
            exists: true,
            overwrite: false,
            outputPath: "output/result.txt",
            inputPath: "input.txt",
          })
          const content = readFileSync("output/result.txt").toString()
          expect(content).toEqual("original")
        })

        test("overwrites existing file with overwrite flag", async () => {
          mockFs.restore()
          mockFs({
            "input.txt": "Hello {{name}}",
            output: { "result.txt": "original" },
          })
          const config: ScaffoldConfig = { ...baseConfig }
          registerHelpers(config)
          await copyFileTransformed(config, {
            exists: true,
            overwrite: true,
            outputPath: "output/result.txt",
            inputPath: "input.txt",
          })
          const content = readFileSync("output/result.txt").toString()
          expect(content).toEqual("Hello test_app")
        })

        test("calls beforeWrite callback", async () => {
          const config: ScaffoldConfig = {
            ...baseConfig,
            beforeWrite: (content) => content.toString().toUpperCase(),
          }
          registerHelpers(config)
          await createDirIfNotExists("output", { logLevel: LogLevel.none, dryRun: false })
          await copyFileTransformed(config, {
            exists: false,
            overwrite: false,
            outputPath: "output/result.txt",
            inputPath: "input.txt",
          })
          const content = readFileSync("output/result.txt").toString()
          expect(content).toEqual("HELLO TEST_APP")
        })
      },
    ),
  )

  describe(
    "handleTemplateFile",
    withMock(
      {
        input: {
          "{{name}}.txt": "Content for {{name}}",
        },
        output: {},
      },
      () => {
        test("processes template file end to end", async () => {
          const config: ScaffoldConfig = { ...baseConfig, tmpDir: "." }
          registerHelpers(config)
          await handleTemplateFile(config, {
            templatePath: "input/{{name}}.txt",
            basePath: "",
          })
          const content = readFileSync(path.join("output", "test_app.txt")).toString()
          expect(content).toEqual("Content for test_app")
        })

        test("throws for non-existing template", async () => {
          const config: ScaffoldConfig = { ...baseConfig, tmpDir: "." }
          registerHelpers(config)
          await expect(
            handleTemplateFile(config, {
              templatePath: "non-existing.txt",
              basePath: "",
            }),
          ).rejects.toThrow()
        })
      },
    ),
  )
})
