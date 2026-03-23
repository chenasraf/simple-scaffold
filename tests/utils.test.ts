import { describe, test, expect } from "vitest"
import { handleErr, resolve, wrapNoopResolver, colorize, TermColor } from "../src/utils"
describe("utils", () => {
  describe("resolve", () => {
    test("should resolve function", () => {
      expect(resolve(() => 1, null)).toBe(1)
      expect(resolve((x) => x, 2)).toBe(2)
    })

    test("should resolve value", () => {
      expect(resolve(1, null)).toBe(1)
      expect(resolve(2, 1)).toBe(2)
    })

    test("should resolve function with argument transformation", () => {
      expect(resolve((x: number) => x * 2, 5)).toBe(10)
    })

    test("should resolve static string", () => {
      expect(resolve("hello", null)).toBe("hello")
    })

    test("should resolve static boolean", () => {
      expect(resolve(true, null)).toBe(true)
      expect(resolve(false, null)).toBe(false)
    })

    test("should resolve static object", () => {
      const obj = { key: "value" }
      expect(resolve(obj, null)).toBe(obj)
    })

    test("should resolve function returning object", () => {
      expect(resolve(() => ({ key: "value" }), null)).toEqual({ key: "value" })
    })

    test("should pass argument to function", () => {
      const fn = (config: { name: string }) => config.name
      expect(resolve(fn, { name: "test" })).toBe("test")
    })

    test("should resolve zero", () => {
      expect(resolve(0, null)).toBe(0)
    })

    test("should resolve null", () => {
      expect(resolve(null, "anything")).toBe(null)
    })

    test("should resolve undefined", () => {
      expect(resolve(undefined, "anything")).toBe(undefined)
    })
  })

  describe("handleErr", () => {
    test("should throw error", () => {
      expect(() => handleErr({ name: "test", message: "test" })).toThrow()
      expect(() => handleErr(null as never)).not.toThrow()
    })

    test("should throw the provided error", () => {
      const err = new Error("test error")
      expect(() => handleErr(err as unknown as NodeJS.ErrnoException)).toThrow("test error")
    })
  })

  describe("wrapNoopResolver", () => {
    test("should wrap static value in function", () => {
      const wrapped = wrapNoopResolver("hello")
      expect(typeof wrapped).toBe("function")
      expect((wrapped as Function)("anything")).toBe("hello")
    })

    test("should return function as-is", () => {
      const fn = (x: string) => x.toUpperCase()
      const wrapped = wrapNoopResolver(fn)
      expect(wrapped).toBe(fn)
    })

    test("should wrap object value", () => {
      const obj = { key: "value" }
      const wrapped = wrapNoopResolver(obj)
      expect(typeof wrapped).toBe("function")
      expect((wrapped as Function)("anything")).toBe(obj)
    })

    test("should wrap boolean value", () => {
      const wrapped = wrapNoopResolver(true)
      expect(typeof wrapped).toBe("function")
      expect((wrapped as Function)(null)).toBe(true)
    })

    test("should wrap number value", () => {
      const wrapped = wrapNoopResolver(42)
      expect(typeof wrapped).toBe("function")
      expect((wrapped as Function)(null)).toBe(42)
    })
  })
})

describe("colorize", () => {
  test("should colorize text with red color", () => {
    const result = colorize("Hello", "red")
    expect(result).toBe("\x1b[31mHello\x1b[0m")
  })

  test("should colorize text with bold", () => {
    const result = colorize("Hello", "bold")
    expect(result).toBe("\x1b[1mHello\x1b[23m")
  })

  test("should reset color", () => {
    const result = colorize("Hello", "reset")
    expect(result).toBe("\x1b[0mHello\x1b[0m")
  })

  test("should have all color functions", () => {
    const colors: TermColor[] = [
      "reset",
      "dim",
      "bold",
      "italic",
      "underline",
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "white",
      "gray",
    ]
    colors.forEach((color) => {
      expect(typeof colorize[color]).toBe("function")
    })
  })

  test("should colorize text using colorize.red", () => {
    const result = colorize.red("Hello")
    expect(result).toBe("\x1b[31mHello\x1b[0m")
  })

  test("should colorize text using template strings with colorize.blue", () => {
    const result = colorize.blue`Hello ${"World"}`
    expect(result).toBe("\x1b[34mHello World\x1b[0m")
  })

  test("should colorize with green", () => {
    expect(colorize("Hello", "green")).toBe("\x1b[32mHello\x1b[0m")
  })

  test("should colorize with yellow", () => {
    expect(colorize("Hello", "yellow")).toBe("\x1b[33mHello\x1b[0m")
  })

  test("should colorize with magenta", () => {
    expect(colorize("Hello", "magenta")).toBe("\x1b[35mHello\x1b[0m")
  })

  test("should colorize with cyan", () => {
    expect(colorize("Hello", "cyan")).toBe("\x1b[36mHello\x1b[0m")
  })

  test("should colorize with white", () => {
    expect(colorize("Hello", "white")).toBe("\x1b[37mHello\x1b[0m")
  })

  test("should colorize with gray", () => {
    expect(colorize("Hello", "gray")).toBe("\x1b[90mHello\x1b[0m")
  })

  test("should colorize with dim", () => {
    expect(colorize("Hello", "dim")).toBe("\x1b[2mHello\x1b[22m")
  })

  test("should colorize with italic", () => {
    expect(colorize("Hello", "italic")).toBe("\x1b[3mHello\x1b[23m")
  })

  test("should colorize with underline", () => {
    expect(colorize("Hello", "underline")).toBe("\x1b[4mHello\x1b[24m")
  })

  test("color functions work as template strings", () => {
    const name = "World"
    expect(colorize.green`Hello ${name}`).toBe("\x1b[32mHello World\x1b[0m")
  })

  test("color functions work with direct call", () => {
    expect(colorize.yellow("warning")).toBe("\x1b[33mwarning\x1b[0m")
    expect(colorize.cyan("info")).toBe("\x1b[36minfo\x1b[0m")
  })

  test("handles empty string", () => {
    expect(colorize("", "red")).toBe("\x1b[31m\x1b[0m")
  })

  test("handles special characters", () => {
    expect(colorize("hello\nworld", "blue")).toBe("\x1b[34mhello\nworld\x1b[0m")
  })

  test("template string with multiple interpolations", () => {
    const a = "one"
    const b = "two"
    expect(colorize.red`${a} and ${b}`).toBe("\x1b[31mone and two\x1b[0m")
  })
})
