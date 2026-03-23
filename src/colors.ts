/** ANSI color code mapping for terminal output. */
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

/** Available terminal color names. */
export type TermColor = keyof typeof colorMap

function _colorize(text: string, color: TermColor): string {
  const c = colorMap[color]!
  let r = 0

  if (c > 1 && c < 30) {
    r = c + 20
  } else if (c === 1) {
    r = 23
  } else {
    r = 0
  }

  return `\x1b[${c}m${text}\x1b[${r}m`
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

/**
 * Colorize text for terminal output.
 *
 * Can be used as a function: `colorize("text", "red")`
 * Or via named helpers: `colorize.red("text")` / `colorize.red\`template\``
 */
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
