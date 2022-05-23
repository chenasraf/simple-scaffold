import { dateHelper, getTemplateFileInfo, handlebarsParse, nowHelper } from "../src/utils"
import { ScaffoldConfig } from "../src/types"
import path from "path"
import * as dateFns from "date-fns"

const blankConf: ScaffoldConfig = {
  verbose: 0,
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
}

describe("Utils", () => {
  describe("getTemplateFileInfo", () => {
    mockPathSep()

    test("should fix paths properly for windows", async () => {
      const result = await getTemplateFileInfo(
        {
          output: "/output",
          templates: ["/example/template/**/*"],
          name: "test",
        },
        {
          basePath: "/example/base",
          templatePath: "/example/template/file.ext",
        },
      )
      expect(result).toHaveProperty("inputPath", "\\example\\template\\file.ext")
      expect(result).toHaveProperty("outputPathOpt", "\\output")
      expect(result).toHaveProperty("outputDir", "\\example\\base")
      expect(result).toHaveProperty("outputPath", "\\example\\base\\file.ext")
    })
  })

  describe("handlebarsParse", () => {
    describe("windows paths", () => {
      mockPathSep()
      test("should work for windows paths", async () => {
        expect(handlebarsParse(blankConf, "C:\\exports\\{{name}}.txt", { isPath: true })).toEqual(
          Buffer.from("C:\\exports\\test.txt"),
        )
      })
    })
    describe("non-windows paths", () => {
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
})

function mockPathSep() {
  let origSep: any
  const sep = "\\"
  beforeAll(() => {
    origSep = path.sep
    Object.defineProperty(path, "sep", { value: sep })
    Object.defineProperty(path, "join", { value: (...args: string[]) => args.join(sep) })
    Object.defineProperty(path, "basename", { value: (arg: string) => arg.split(sep).slice(-1) })
  })
  afterAll(() => {
    Object.defineProperty(path, "sep", { value: origSep })
    Object.defineProperty(path, "join", { value: (...args: string[]) => args.join(origSep) })
    Object.defineProperty(path, "basename", { value: (arg: string) => arg.split(origSep).slice(-1) })
  })
}
