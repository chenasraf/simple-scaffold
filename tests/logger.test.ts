import { describe, test, expect, beforeEach, afterEach, vi, type MockInstance } from "vitest"
import { log, logInitStep, logInputFile } from "../src/logger"
import { LogLevel, ScaffoldConfig } from "../src/types"

describe("logger", () => {
  let consoleSpy: {
    log: MockInstance
    warn: MockInstance
    error: MockInstance
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => void 0),
      warn: vi.spyOn(console, "warn").mockImplementation(() => void 0),
      error: vi.spyOn(console, "error").mockImplementation(() => void 0),
    }
  })

  afterEach(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe("log", () => {
    test("does not log when logLevel is none", () => {
      log({ logLevel: LogLevel.none }, LogLevel.info, "test")
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    test("logs info messages with console.log", () => {
      log({ logLevel: LogLevel.info }, LogLevel.info, "test message")
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("logs warning messages with console.warn", () => {
      log({ logLevel: LogLevel.warning }, LogLevel.warning, "warning message")
      expect(consoleSpy.warn).toHaveBeenCalled()
    })

    test("logs error messages with console.error", () => {
      log({ logLevel: LogLevel.error }, LogLevel.error, "error message")
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    test("filters out messages below configured level", () => {
      log({ logLevel: LogLevel.warning }, LogLevel.info, "should be filtered")
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    test("filters out debug messages when level is info", () => {
      log({ logLevel: LogLevel.info }, LogLevel.debug, "debug message")
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })

    test("shows debug messages when level is debug", () => {
      log({ logLevel: LogLevel.debug }, LogLevel.debug, "debug message")
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("shows all levels when configured as debug", () => {
      log({ logLevel: LogLevel.debug }, LogLevel.debug, "d")
      log({ logLevel: LogLevel.debug }, LogLevel.info, "i")
      log({ logLevel: LogLevel.debug }, LogLevel.warning, "w")
      log({ logLevel: LogLevel.debug }, LogLevel.error, "e")
      expect(consoleSpy.log).toHaveBeenCalledTimes(2) // debug + info
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1)
      expect(consoleSpy.error).toHaveBeenCalledTimes(1)
    })

    test("handles Error objects", () => {
      log({ logLevel: LogLevel.error }, LogLevel.error, new Error("test error"))
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    test("handles objects with util.inspect", () => {
      log({ logLevel: LogLevel.info }, LogLevel.info, { key: "value" })
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("handles multiple arguments", () => {
      log({ logLevel: LogLevel.info }, LogLevel.info, "a", "b", "c")
      expect(consoleSpy.log).toHaveBeenCalled()
      // First call, should have 3 arguments
      expect(consoleSpy.log.mock.calls[0].length).toBe(3)
    })

    test("defaults to info when logLevel is undefined", () => {
      log({ logLevel: undefined as unknown as LogLevel }, LogLevel.info, "test")
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("error level shows when logLevel is info", () => {
      log({ logLevel: LogLevel.info }, LogLevel.error, "error")
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    test("warning level shows when logLevel is info", () => {
      log({ logLevel: LogLevel.info }, LogLevel.warning, "warning")
      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe("logInitStep", () => {
    test("logs config at debug level", () => {
      const config: ScaffoldConfig = {
        name: "test",
        output: "output",
        templates: ["input"],
        logLevel: LogLevel.debug,
        data: { name: "test" },
      }
      logInitStep(config)
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("does not log config at info level (debug only)", () => {
      const config: ScaffoldConfig = {
        name: "test",
        output: "output",
        templates: ["input"],
        logLevel: LogLevel.info,
        data: { name: "test" },
      }
      logInitStep(config)
      // Should only log the "Data:" line at info, not the "Full config:" at debug
      expect(consoleSpy.log).toHaveBeenCalledTimes(1)
    })
  })

  describe("logInputFile", () => {
    test("logs file info at debug level", () => {
      const config: ScaffoldConfig = {
        name: "test",
        output: "output",
        templates: ["input"],
        logLevel: LogLevel.debug,
        data: { name: "test" },
      }
      logInputFile(config, {
        originalTemplate: "input",
        relativePath: ".",
        parsedTemplate: "input/**/*",
        inputFilePath: "input/file.txt",
        nonGlobTemplate: "input",
        basePath: "",
        isDirOrGlob: true,
        isGlob: false,
      })
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    test("does not log at info level", () => {
      const config: ScaffoldConfig = {
        name: "test",
        output: "output",
        templates: ["input"],
        logLevel: LogLevel.info,
        data: { name: "test" },
      }
      logInputFile(config, {
        originalTemplate: "input",
        relativePath: ".",
        parsedTemplate: "input/**/*",
        inputFilePath: "input/file.txt",
        nonGlobTemplate: "input",
        basePath: "",
        isDirOrGlob: true,
        isGlob: false,
      })
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })
})
