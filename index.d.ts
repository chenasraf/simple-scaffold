export namespace IScaffold {

  export interface IConfig {
    templates: string[]
    output: string | ((path: string) => string)
    locals?: any
  }

  export interface IReplacement {
    find: string | RegExp
    replace(): string
    [other: string]: any
  }

}
