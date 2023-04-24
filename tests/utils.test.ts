import { dateHelper, handlebarsParse, nowHelper, parseAppendData } from "../src/utils"
import { ScaffoldCmdConfig, ScaffoldConfig } from "../src/types"
import path from "path"
import * as dateFns from "date-fns"
import { OptionsBase } from "massarg/types"

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

  describe("parseAppendData", () => {
    test('works for "key=value"', () => {
      expect(parseAppendData("key=value", blankCliConf)).toEqual({ key: "value", name: "test" })
    })

    test('works for "key:=value"', () => {
      expect(parseAppendData("key:=123", blankCliConf)).toEqual({ key: 123, name: "test" })
    })

    test("overwrites existing value", () => {
      expect(parseAppendData("name:=123", blankCliConf)).toEqual({ name: 123 })
    })
  })
})
