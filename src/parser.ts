import path from "node:path"
import { DefaultHelpers, Helper, LogLevel, ScaffoldConfig } from "./types"
import Handlebars from "handlebars"
import { add, format, parseISO, type Duration } from "date-fns"
import { log } from "./logger"

const dateFns = { add, format, parseISO }

export const defaultHelpers: Record<DefaultHelpers, Helper> = {
  camelCase,
  snakeCase,
  startCase,
  kebabCase,
  hyphenCase: kebabCase,
  pascalCase,
  lowerCase: (text) => text.toLowerCase(),
  upperCase: (text) => text.toUpperCase(),
  now: nowHelper,
  date: dateHelper,
}

function _dateHelper(date: Date, formatString: string): string
function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string
function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration,
): string {
  if (durationType && durationDifference !== undefined) {
    return dateFns.format(dateFns.add(date, { [durationType]: durationDifference }), formatString)
  }
  return dateFns.format(date, formatString)
}

export function nowHelper(formatString: string): string
export function nowHelper(
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string
export function nowHelper(
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration,
): string {
  return _dateHelper(new Date(), formatString, durationDifference!, durationType!)
}

export function dateHelper(date: string, formatString: string): string
export function dateHelper(
  date: string,
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string
export function dateHelper(
  date: string,
  formatString: string,
  durationDifference?: number,
  durationType?: keyof Duration,
): string {
  return _dateHelper(dateFns.parseISO(date), formatString, durationDifference!, durationType!)
}

// splits by either non-alphanumeric character or capital letter boundaries
function toWordParts(string: string): string[] {
  // First split on non-alphanumeric characters
  return string
    .split(/[^a-zA-Z0-9]/)
    .flatMap((segment) =>
      // Then split camelCase/PascalCase boundaries, handling consecutive uppercase (e.g. "HTMLParser" -> "HTML", "Parser")
      segment.split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/),
    )
    .filter((s) => s.length > 0)
}

function camelCase(s: string): string {
  return toWordParts(s).reduce((acc, part, i) => {
    if (i === 0) {
      return part.toLowerCase()
    }
    return acc + part[0].toUpperCase() + part.slice(1).toLowerCase()
  }, "")
}

function snakeCase(s: string): string {
  return toWordParts(s).join("_").toLowerCase()
}

function kebabCase(s: string): string {
  return toWordParts(s).join("-").toLowerCase()
}

function startCase(s: string): string {
  return toWordParts(s)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function pascalCase(s: string): string {
  return startCase(s).replace(/\s+/g, "")
}

export function registerHelpers(config: ScaffoldConfig): void {
  const _helpers = { ...defaultHelpers, ...config.helpers }
  for (const helperName in _helpers) {
    log(config, LogLevel.debug, `Registering helper: ${helperName}`)
    Handlebars.registerHelper(helperName, _helpers[helperName as keyof typeof _helpers])
  }
}

export function handlebarsParse(
  config: ScaffoldConfig,
  templateBuffer: Buffer | string,
  { asPath = false }: { asPath?: boolean } = {},
): Buffer {
  const { data } = config
  try {
    let str = templateBuffer.toString()
    if (asPath) {
      str = str.replace(/\\/g, "/")
    }
    const parser = Handlebars.compile(str, { noEscape: true })
    let outputContents = parser(data)
    if (asPath && path.sep !== "/") {
      outputContents = outputContents.replace(/\//g, "\\")
    }
    return Buffer.from(outputContents)
  } catch (e) {
    log(config, LogLevel.debug, e)
    log(config, LogLevel.info, "Couldn't parse file with handlebars, returning original content")
    return Buffer.from(templateBuffer)
  }
}
