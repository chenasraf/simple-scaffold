import { handleErr, resolve, colorize, TermColor } from "../src/utils"
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
  })

  describe("handleErr", () => {
    test("should throw error", () => {
      expect(() => handleErr({ name: "test", message: "test" })).toThrow()
      expect(() => handleErr(null as never)).not.toThrow()
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
})
