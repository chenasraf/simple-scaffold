import { Resolver } from "./types"

export function handleErr(err: NodeJS.ErrnoException | null): void {
  if (err) throw err
}

export function resolve<T, R = T>(resolver: Resolver<T, R>, arg: T): R {
  return typeof resolver === "function" ? (resolver as (value: T) => R)(arg) : (resolver as R)
}
