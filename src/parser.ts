import path from "path"
import { DefaultHelpers, Helper, LogLevel, ScaffoldConfig } from "./types"
import camelCase from "lodash/camelCase"
import snakeCase from "lodash/snakeCase"
import kebabCase from "lodash/kebabCase"
import startCase from "lodash/startCase"
import Handlebars from "handlebars"
import dtAdd from "date-fns/add"
import dtFormat from "date-fns/format"
import dtParseISO from "date-fns/parseISO"
import { log } from "./logger"

const dateFns = {
  add: dtAdd,
  format: dtFormat,
  parseISO: dtParseISO,
}

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

export function _dateHelper(date: Date, formatString: string): string
export function _dateHelper(
  date: Date,
  formatString: string,
  durationDifference: number,
  durationType: keyof Duration,
): string
export function _dateHelper(
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
export function nowHelper(formatString: string, durationDifference: number, durationType: keyof Duration): string
export function nowHelper(formatString: string, durationDifference?: number, durationType?: keyof Duration): string {
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

export function pascalCase(s: string): string {
  return startCase(s).replace(/\s+/g, "")
}

export function registerHelpers(config: ScaffoldConfig): void {
  const _helpers = { ...defaultHelpers, ...config.helpers }
  for (const helperName in _helpers) {
    log(config, LogLevel.Debug, `Registering helper: ${helperName}`)
    Handlebars.registerHelper(helperName, _helpers[helperName as keyof typeof _helpers])
  }
}

export function handlebarsParse(
  config: ScaffoldConfig,
  templateBuffer: Buffer | string,
  { isPath = false }: { isPath?: boolean } = {},
): Buffer {
  const { data } = config
  try {
    let str = templateBuffer.toString()
    if (isPath) {
      str = str.replace(/\\/g, "/")
    }
    const parser = Handlebars.compile(str, { noEscape: true })
    let outputContents = parser(data)
    if (isPath && path.sep !== "/") {
      outputContents = outputContents.replace(/\//g, "\\")
    }
    return Buffer.from(outputContents)
  } catch (e) {
    log(config, LogLevel.Debug, e)
    log(config, LogLevel.Warning, "Couldn't parse file with handlebars, returning original content")
    return Buffer.from(templateBuffer)
  }
}
