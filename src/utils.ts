import { Resolver } from "./types"

// Re-export colors for backward compatibility
export { colorize, type TermColor } from "./colors"

/** Throws the error if non-null, no-ops otherwise. */
export function handleErr(err: NodeJS.ErrnoException | null): void {
  if (err) throw err
}

/** Resolves a value that may be either a static value or a function that produces one. */
export function resolve<T, R = T>(resolver: Resolver<T, R>, arg: T): R {
  return typeof resolver === "function" ? (resolver as (value: T) => R)(arg) : (resolver as R)
}

/** Wraps a static value in a resolver function. If already a function, returns as-is. */
export function wrapNoopResolver<T, R = T>(value: Resolver<T, R>): Resolver<T, R> {
  if (typeof value === "function") {
    return value
  }

  return (_) => value
}
