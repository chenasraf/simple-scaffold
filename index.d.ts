declare namespace IScaffold {

  export interface IConfig {
    name?: string
    templates: string[]
    output: string | ((path: string, base: string) => string)
    locals?: any
  }

  export interface IReplacement {
    find: string | RegExp
    replace(): string
    [other: string]: any
  }

  export interface IFileRepr {
    base: string
    file: string
  }
}

export default IScaffold
