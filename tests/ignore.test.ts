import { describe, test, expect, beforeEach, afterEach } from "vitest"
import mockFs from "mock-fs"
import { Console } from "console"
import path from "node:path"
import { parseIgnoreFile, loadIgnorePatterns, filterIgnoredFiles } from "../src/ignore"

describe("ignore", () => {
  describe("parseIgnoreFile", () => {
    test("parses patterns", () => {
      const result = parseIgnoreFile("node_modules\n*.log\n")
      expect(result).toEqual(["node_modules", "*.log"])
    })

    test("skips comments", () => {
      const result = parseIgnoreFile("# comment\nfoo\n# another\nbar")
      expect(result).toEqual(["foo", "bar"])
    })

    test("skips empty lines", () => {
      const result = parseIgnoreFile("foo\n\n\nbar\n")
      expect(result).toEqual(["foo", "bar"])
    })

    test("trims whitespace", () => {
      const result = parseIgnoreFile("  foo  \n  bar  ")
      expect(result).toEqual(["foo", "bar"])
    })

    test("handles empty file", () => {
      expect(parseIgnoreFile("")).toEqual([])
    })

    test("handles comments-only file", () => {
      expect(parseIgnoreFile("# just comments\n# nothing here")).toEqual([])
    })
  })

  describe("filterIgnoredFiles", () => {
    test("filters files matching patterns", () => {
      const files = ["templates/file.txt", "templates/debug.log", "templates/other.js"]
      const result = filterIgnoredFiles(files, ["*.log"], "templates")
      expect(result).toEqual(["templates/file.txt", "templates/other.js"])
    })

    test("always excludes .scaffoldignore", () => {
      const files = ["templates/file.txt", "templates/.scaffoldignore"]
      const result = filterIgnoredFiles(files, [], "templates")
      expect(result).toEqual(["templates/file.txt"])
    })

    test("matches by relative path", () => {
      const files = ["templates/src/index.ts", "templates/dist/index.js", "templates/src/utils.ts"]
      const result = filterIgnoredFiles(files, ["dist/**"], "templates")
      expect(result).toEqual(["templates/src/index.ts", "templates/src/utils.ts"])
    })

    test("matches by basename", () => {
      const files = ["templates/README.md", "templates/nested/README.md", "templates/file.txt"]
      const result = filterIgnoredFiles(files, ["README.md"], "templates")
      expect(result).toEqual(["templates/file.txt"])
    })

    test("handles multiple patterns", () => {
      const files = ["tpl/a.txt", "tpl/b.log", "tpl/c.tmp", "tpl/d.ts"]
      const result = filterIgnoredFiles(files, ["*.log", "*.tmp"], "tpl")
      expect(result).toEqual(["tpl/a.txt", "tpl/d.ts"])
    })

    test("returns all files when no patterns", () => {
      const files = ["tpl/a.txt", "tpl/b.txt"]
      const result = filterIgnoredFiles(files, [], "tpl")
      expect(result).toEqual(files)
    })

    test("handles glob patterns with directories", () => {
      const files = [
        path.join("tpl", "src", "index.ts"),
        path.join("tpl", "node_modules", "pkg", "index.js"),
        path.join("tpl", "file.txt"),
      ]
      const result = filterIgnoredFiles(files, ["node_modules/**"], "tpl")
      expect(result).toEqual([path.join("tpl", "src", "index.ts"), path.join("tpl", "file.txt")])
    })
  })

  describe("loadIgnorePatterns", () => {
    beforeEach(() => {
      console = new Console(process.stdout, process.stderr)
    })

    afterEach(() => {
      mockFs.restore()
    })

    test("returns empty array when no .scaffoldignore exists", async () => {
      mockFs({ templates: { "file.txt": "content" } })
      const result = await loadIgnorePatterns("templates")
      expect(result).toEqual([])
    })

    test("reads and parses .scaffoldignore", async () => {
      mockFs({
        templates: {
          ".scaffoldignore": "*.log\nnode_modules\n",
          "file.txt": "content",
        },
      })
      const result = await loadIgnorePatterns("templates")
      expect(result).toEqual(["*.log", "node_modules"])
    })

    test("ignores comments in .scaffoldignore", async () => {
      mockFs({
        templates: {
          ".scaffoldignore": "# This is a comment\n*.tmp\n",
        },
      })
      const result = await loadIgnorePatterns("templates")
      expect(result).toEqual(["*.tmp"])
    })
  })
})
