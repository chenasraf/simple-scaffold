import { Resolver } from "./types"

export function handleErr(err: NodeJS.ErrnoException | null): void {
  if (err) throw err
}

export function resolve<T, R = T>(resolver: Resolver<T, R>, arg: T): R {
  return typeof resolver === "function" ? (resolver as (value: T) => R)(arg) : (resolver as R)
}

export function wrapNoopResolver<T, R = T>(value: Resolver<T, R>): Resolver<T, R> {
  if (typeof value === "function") {
    return value
  }

  return (_) => value
}

const colorMap = {
  reset: 0,
  dim: 2,
  bold: 1,
  italic: 3,
  underline: 4,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
} as const

export type TermColor = keyof typeof colorMap

function _colorize(text: string, color: TermColor): string {
  const c = colorMap[color]!
  return `\x1b[${c}m${text}\x1b[0m`
}

function isTemplateStringArray(template: TemplateStringsArray | unknown): template is TemplateStringsArray {
  return Array.isArray(template) && typeof template[0] === "string"
}

const createColorize =
  (color: TermColor) =>
    (template: TemplateStringsArray | unknown, ...params: unknown[]): string => {
      return isTemplateStringArray(template)
        ? _colorize(
          (template as TemplateStringsArray).reduce((acc, str, i) => acc + str + (params[i] ?? ""), ""),
          color,
        )
        : _colorize(String(template), color)
    }

type TemplateStringsFn = ReturnType<typeof createColorize> & ((text: string) => string)
type TemplateStringsFns = { [key in TermColor]: TemplateStringsFn }

export const colorize: typeof _colorize & TemplateStringsFns = Object.assign(
  _colorize,
  Object.entries(colorMap).reduce(
    (acc, [key]) => {
      acc[key as TermColor] = createColorize(key as TermColor)
      return acc
    },
    {} as Record<TermColor, TemplateStringsFn>,
  ),
)
