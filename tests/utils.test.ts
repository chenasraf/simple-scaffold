import { handlebarsParse } from "../src/utils"
import path from "path"

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
        expect(
          handlebarsParse(
            {
              verbose: 0,
              name: "",
              output: "",
              templates: [],
            },
            "C:\\exports\\{{name}}.txt",
            { name: "test" },
            { isPath: true }
          )
        ).toEqual("C:\\exports\\test.txt")
      })
    })
    test("should work for non-windows paths", async () => {
      expect(
        handlebarsParse(
          {
            verbose: 0,
            name: "",
            output: "",
            templates: [],
          },
          "/home/test/{{name}}.txt",
          { name: "test" },
          { isPath: true }
        )
      ).toEqual("/home/test/test.txt")
    })
    test("should not do path escaping on non-path compiles", async () => {
      expect(
        handlebarsParse(
          {
            verbose: 0,
            name: "",
            output: "",
            templates: [],
          },
          "/home/test/{{name}} \\{{escaped}}.txt",
          { name: "test" },
          { isPath: false }
        )
      ).toEqual("/home/test/test {{escaped}}.txt")
    })
  })
})
