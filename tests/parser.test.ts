import { ScaffoldConfig } from "../src/types"
import path from "node:path"
import * as dateFns from "date-fns"
import { dateHelper, defaultHelpers, handlebarsParse, nowHelper, registerHelpers } from "../src/parser"

const blankConf: ScaffoldConfig = {
  logLevel: "none",
  name: "",
  output: "",
  templates: [],
  data: { name: "test" },
}

describe("parser", () => {
  describe("handlebarsParse", () => {
    let origSep: string

    describe("windows paths", () => {
      beforeAll(() => {
        origSep = path.sep
        Object.defineProperty(path, "sep", { value: "\\" })
      })

      afterAll(() => {
        Object.defineProperty(path, "sep", { value: origSep })
      })

      test("should work for windows paths", async () => {
        expect(handlebarsParse(blankConf, "C:\\exports\\{{name}}.txt", { asPath: true }).toString()).toEqual(
          "C:\\exports\\test.txt",
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
        expect(handlebarsParse(blankConf, "/home/test/{{name}}.txt", { asPath: true })).toEqual(
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
            asPath: false,
          },
        ),
      ).toEqual(Buffer.from("/home/test/test {{escaped}}.txt"))
    })

    test("should replace name token in content", () => {
      const result = handlebarsParse(blankConf, "Hello {{name}}")
      expect(result.toString()).toEqual("Hello test")
    })

    test("should replace multiple tokens", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "app", version: "1.0" },
      }
      expect(handlebarsParse(config, "{{name}} v{{version}}").toString()).toEqual("app v1.0")
    })

    test("should return Buffer", () => {
      expect(Buffer.isBuffer(handlebarsParse(blankConf, "test"))).toBe(true)
    })

    test("should handle Buffer input", () => {
      expect(handlebarsParse(blankConf, Buffer.from("Hello {{name}}")).toString()).toEqual("Hello test")
    })

    test("should return original content on handlebars error", () => {
      const result = handlebarsParse(blankConf, "{{#if}}invalid{{/unless}}")
      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result.toString()).toEqual("{{#if}}invalid{{/unless}}")
    })

    test("should handle empty template", () => {
      expect(handlebarsParse(blankConf, "").toString()).toEqual("")
    })

    test("should handle template with no tokens", () => {
      expect(handlebarsParse(blankConf, "no tokens here").toString()).toEqual("no tokens here")
    })

    test("should not escape HTML chars (noEscape)", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "<div>test</div>" },
      }
      expect(handlebarsParse(config, "{{name}}").toString()).toEqual("<div>test</div>")
    })

    test("should handle nested data", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "test", nested: { key: "value" } },
      }
      expect(handlebarsParse(config, "{{nested.key}}").toString()).toEqual("value")
    })

    test("should handle handlebars conditionals", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "test", showExtra: true },
      }
      registerHelpers(config)
      expect(handlebarsParse(config, "{{#if showExtra}}extra{{/if}} content").toString()).toEqual("extra content")
    })

    test("should handle handlebars conditionals when false", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "test", showExtra: false },
      }
      registerHelpers(config)
      expect(handlebarsParse(config, "{{#if showExtra}}extra{{/if}}content").toString()).toEqual("content")
    })

    test("should handle handlebars each loops", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        data: { name: "test", items: ["a", "b", "c"] },
      }
      registerHelpers(config)
      expect(handlebarsParse(config, "{{#each items}}{{this}},{{/each}}").toString()).toEqual("a,b,c,")
    })

    test("should render empty for undefined data token", () => {
      expect(handlebarsParse(blankConf, "{{undefinedVar}}").toString()).toEqual("")
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

    describe("string helpers edge cases", () => {
      test("camelCase single word", () => {
        expect(defaultHelpers.camelCase("hello")).toEqual("hello")
      })

      test("camelCase empty string", () => {
        expect(defaultHelpers.camelCase("")).toEqual("")
      })

      test("camelCase all uppercase", () => {
        expect(defaultHelpers.camelCase("HELLO WORLD")).toEqual("helloWorld")
      })

      test("pascalCase single word", () => {
        expect(defaultHelpers.pascalCase("hello")).toEqual("Hello")
      })

      test("pascalCase empty string", () => {
        expect(defaultHelpers.pascalCase("")).toEqual("")
      })

      test("snakeCase single word", () => {
        expect(defaultHelpers.snakeCase("hello")).toEqual("hello")
      })

      test("snakeCase empty string", () => {
        expect(defaultHelpers.snakeCase("")).toEqual("")
      })

      test("kebabCase single word", () => {
        expect(defaultHelpers.kebabCase("hello")).toEqual("hello")
      })

      test("kebabCase empty string", () => {
        expect(defaultHelpers.kebabCase("")).toEqual("")
      })

      test("startCase single word", () => {
        expect(defaultHelpers.startCase("hello")).toEqual("Hello")
      })

      test("startCase empty string", () => {
        expect(defaultHelpers.startCase("")).toEqual("")
      })

      test("hyphenCase is same as kebabCase", () => {
        expect(defaultHelpers.hyphenCase("testString")).toEqual(defaultHelpers.kebabCase("testString"))
        expect(defaultHelpers.hyphenCase("test_string")).toEqual(defaultHelpers.kebabCase("test_string"))
      })

      test("lowerCase lowercases everything", () => {
        expect(defaultHelpers.lowerCase("HELLO")).toEqual("hello")
        expect(defaultHelpers.lowerCase("Hello World")).toEqual("hello world")
      })

      test("upperCase uppercases everything", () => {
        expect(defaultHelpers.upperCase("hello")).toEqual("HELLO")
        expect(defaultHelpers.upperCase("hello world")).toEqual("HELLO WORLD")
      })

      test("camelCase handles numbers in string", () => {
        expect(defaultHelpers.camelCase("item1_name")).toEqual("item1Name")
      })

      test("pascalCase handles multiple separators", () => {
        expect(defaultHelpers.pascalCase("a--b__c  d")).toEqual("ABCD")
      })

      test("snakeCase handles mixed separators", () => {
        expect(defaultHelpers.snakeCase("myApp-name_here")).toEqual("my_app_name_here")
      })

      test("kebabCase handles mixed separators", () => {
        expect(defaultHelpers.kebabCase("myApp-name_here")).toEqual("my-app-name-here")
      })

      test("single character inputs", () => {
        expect(defaultHelpers.camelCase("a")).toEqual("a")
        expect(defaultHelpers.pascalCase("a")).toEqual("A")
        expect(defaultHelpers.snakeCase("a")).toEqual("a")
        expect(defaultHelpers.kebabCase("a")).toEqual("a")
        expect(defaultHelpers.startCase("a")).toEqual("A")
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

        test("should work with years offset", () => {
          const dateStr = "2024-01-15T12:00:00.000Z"
          const date = dateFns.parseISO(dateStr)
          expect(dateHelper(dateStr, "yyyy", 1, "years")).toEqual(
            dateFns.format(dateFns.add(date, { years: 1 }), "yyyy"),
          )
        })

        test("should work with weeks offset", () => {
          const dateStr = "2024-01-15T12:00:00.000Z"
          const date = dateFns.parseISO(dateStr)
          expect(dateHelper(dateStr, "yyyy-MM-dd", 2, "weeks")).toEqual(
            dateFns.format(dateFns.add(date, { weeks: 2 }), "yyyy-MM-dd"),
          )
        })

        test("should work with minutes offset", () => {
          const dateStr = "2024-01-15T12:00:00.000Z"
          const date = dateFns.parseISO(dateStr)
          expect(dateHelper(dateStr, "HH:mm", 30, "minutes")).toEqual(
            dateFns.format(dateFns.add(date, { minutes: 30 }), "HH:mm"),
          )
        })

        test("should work with seconds offset", () => {
          const dateStr = "2024-01-15T12:00:00.000Z"
          const date = dateFns.parseISO(dateStr)
          expect(dateHelper(dateStr, "HH:mm:ss", 45, "seconds")).toEqual(
            dateFns.format(dateFns.add(date, { seconds: 45 }), "HH:mm:ss"),
          )
        })
      })

      describe("now edge cases", () => {
        test("should work with different format tokens", () => {
          const now = new Date()
          expect(nowHelper("yyyy")).toEqual(dateFns.format(now, "yyyy"))
          expect(nowHelper("MM")).toEqual(dateFns.format(now, "MM"))
          expect(nowHelper("dd")).toEqual(dateFns.format(now, "dd"))
        })

        test("should work with positive offset", () => {
          const now = new Date()
          const result = nowHelper("yyyy-MM-dd", 1, "days")
          const expected = dateFns.format(dateFns.add(now, { days: 1 }), "yyyy-MM-dd")
          expect(result).toEqual(expected)
        })

        test("should work with hours offset", () => {
          const now = new Date()
          const result = nowHelper("HH", 2, "hours")
          const expected = dateFns.format(dateFns.add(now, { hours: 2 }), "HH")
          expect(result).toEqual(expected)
        })
      })
    })
  })

  describe("registerHelpers", () => {
    test("registers default helpers", () => {
      const config: ScaffoldConfig = { ...blankConf }
      registerHelpers(config)
      const result = handlebarsParse(
        { ...config, data: { name: "hello_world" } },
        "{{camelCase name}}",
      )
      expect(result.toString()).toEqual("helloWorld")
    })

    test("registers custom helpers", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        helpers: {
          reverse: (text: string) => text.split("").reverse().join(""),
        },
      }
      registerHelpers(config)
      const result = handlebarsParse(
        { ...config, data: { name: "hello" } },
        "{{reverse name}}",
      )
      expect(result.toString()).toEqual("olleh")
    })

    test("custom helpers override default helpers", () => {
      const config: ScaffoldConfig = {
        ...blankConf,
        helpers: {
          camelCase: () => "OVERRIDDEN",
        },
      }
      registerHelpers(config)
      const result = handlebarsParse(
        { ...config, data: { name: "test" } },
        "{{camelCase name}}",
      )
      expect(result.toString()).toEqual("OVERRIDDEN")
    })
  })

  describe("default helpers completeness", () => {
    test("all expected helpers are defined", () => {
      const expectedHelpers = [
        "camelCase", "snakeCase", "startCase", "kebabCase",
        "hyphenCase", "pascalCase", "lowerCase", "upperCase",
        "now", "date",
      ]
      for (const helper of expectedHelpers) {
        expect(defaultHelpers).toHaveProperty(helper)
        expect(typeof defaultHelpers[helper as keyof typeof defaultHelpers]).toBe("function")
      }
    })

    test("has exactly 10 helpers", () => {
      expect(Object.keys(defaultHelpers).length).toBe(10)
    })
  })
})
