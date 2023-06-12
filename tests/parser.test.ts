import { ScaffoldCmdConfig, ScaffoldConfig } from "../src/types"
import path from "node:path"
import * as dateFns from "date-fns"
import { OptionsBase } from "massarg/types"
import { dateHelper, defaultHelpers, handlebarsParse, nowHelper } from "../src/parser"

const blankConf: ScaffoldConfig = {
  verbose: 0,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
}

const blankCliConf: ScaffoldCmdConfig & OptionsBase = {
  verbose: 0,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
  overwrite: false,
  createSubFolder: false,
  dryRun: false,
  quiet: false,
  extras: [],
  help: false,
}

describe("parser", () => {
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
          Buffer.from("C:\\exports\\test.txt"),
        )
      })
    })
    describe("non-windows paths", () => {
      beforeAll(() => {
        origSep = path.sep
        Object.defineProperty(path, "sep", { value: "/" })
      })
      afterAll(() => {
        Object.defineProperty(path, "sep", { value: origSep })
      })
      test("should work for non-windows paths", async () => {
        expect(handlebarsParse(blankConf, "/home/test/{{name}}.txt", { isPath: true })).toEqual(
          Buffer.from("/home/test/test.txt"),
        )
      })
    })
    test("should not do path escaping on non-path compiles", async () => {
      expect(
        handlebarsParse(
          { ...blankConf, data: { ...blankConf.data, escaped: "value" } },
          "/home/test/{{name}} \\{{escaped}}.txt",
          {
            isPath: false,
          },
        ),
      ).toEqual(Buffer.from("/home/test/test {{escaped}}.txt"))
    })
  })

  describe("Helpers", () => {
    describe("string helpers", () => {
      test("camelCase", () => {
        expect(defaultHelpers.camelCase("test string")).toEqual("testString")
        expect(defaultHelpers.camelCase("test_string")).toEqual("testString")
        expect(defaultHelpers.camelCase("test-string")).toEqual("testString")
        expect(defaultHelpers.camelCase("testString")).toEqual("testString")
        expect(defaultHelpers.camelCase("TestString")).toEqual("testString")
        expect(defaultHelpers.camelCase("Test____String")).toEqual("testString")
      })
      test("pascalCase", () => {
        expect(defaultHelpers.pascalCase("test string")).toEqual("TestString")
        expect(defaultHelpers.pascalCase("test_string")).toEqual("TestString")
        expect(defaultHelpers.pascalCase("test-string")).toEqual("TestString")
        expect(defaultHelpers.pascalCase("testString")).toEqual("TestString")
        expect(defaultHelpers.pascalCase("TestString")).toEqual("TestString")
        expect(defaultHelpers.pascalCase("Test____String")).toEqual("TestString")
      })
      test("snakeCase", () => {
        expect(defaultHelpers.snakeCase("test string")).toEqual("test_string")
        expect(defaultHelpers.snakeCase("test_string")).toEqual("test_string")
        expect(defaultHelpers.snakeCase("test-string")).toEqual("test_string")
        expect(defaultHelpers.snakeCase("testString")).toEqual("test_string")
        expect(defaultHelpers.snakeCase("TestString")).toEqual("test_string")
        expect(defaultHelpers.snakeCase("Test____String")).toEqual("test_string")
      })
      test("kebabCase", () => {
        expect(defaultHelpers.kebabCase("test string")).toEqual("test-string")
        expect(defaultHelpers.kebabCase("test_string")).toEqual("test-string")
        expect(defaultHelpers.kebabCase("test-string")).toEqual("test-string")
        expect(defaultHelpers.kebabCase("testString")).toEqual("test-string")
        expect(defaultHelpers.kebabCase("TestString")).toEqual("test-string")
        expect(defaultHelpers.kebabCase("Test____String")).toEqual("test-string")
      })
      test("startCase", () => {
        expect(defaultHelpers.startCase("test string")).toEqual("Test String")
        expect(defaultHelpers.startCase("test_string")).toEqual("Test String")
        expect(defaultHelpers.startCase("test-string")).toEqual("Test String")
        expect(defaultHelpers.startCase("testString")).toEqual("Test String")
        expect(defaultHelpers.startCase("TestString")).toEqual("Test String")
        expect(defaultHelpers.startCase("Test____String")).toEqual("Test String")
      })
    })
    describe("date helpers", () => {
      describe("now", () => {
        test("should work without extra params", () => {
          const now = new Date()
          const fmt = "yyyy-MM-dd HH:mm"

          expect(nowHelper(fmt)).toEqual(dateFns.format(now, fmt))
        })
      })

      describe("date", () => {
        test("should work with no offset params", () => {
          const now = new Date()
          const fmt = "yyyy-MM-dd HH:mm"

          expect(dateHelper(now.toISOString(), fmt)).toEqual(dateFns.format(now, fmt))
        })

        test("should work with offset params", () => {
          const now = new Date()
          const fmt = "yyyy-MM-dd HH:mm"

          expect(dateHelper(now.toISOString(), fmt, -1, "days")).toEqual(
            dateFns.format(dateFns.add(now, { days: -1 }), fmt),
          )
          expect(dateHelper(now.toISOString(), fmt, 1, "months")).toEqual(
            dateFns.format(dateFns.add(now, { months: 1 }), fmt),
          )
        })
      })
    })
  })
})
