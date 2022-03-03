import { handlebarsParse } from "../src/utils"
import { ScaffoldConfig } from "../src/types"
import path from "path"

const blankConf: ScaffoldConfig = {
  verbose: 0,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
}

describe("Utils", () => {
  describe("handlebarsParse", () => {
    let origSep: any
    describe("windows paths", () => {
      beforeAll(() => {
        origSep = path.sep
        Object.defineProperty(path, "sep", { value: "\\" })
      })
      afterAll(() => {
        Object.defineProperty(path, "sep", { value: origSep })
      })
      test("should work for windows paths", async () => {
        expect(handlebarsParse(blankConf, "C:\\exports\\{{name}}.txt", { isPath: true })).toEqual(
          "C:\\exports\\test.txt"
        )
      })
    })
    test("should work for non-windows paths", async () => {
      expect(handlebarsParse(blankConf, "/home/test/{{name}}.txt", { isPath: true })).toEqual("/home/test/test.txt")
    })
    test("should not do path escaping on non-path compiles", async () => {
      expect(handlebarsParse(blankConf, "/home/test/{{name}} \\{{escaped}}.txt", { isPath: false })).toEqual(
        "/home/test/test {{escaped}}.txt"
      )
    })
  })
})
