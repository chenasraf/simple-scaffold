import { handleErr, resolve } from "../src/utils"

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
