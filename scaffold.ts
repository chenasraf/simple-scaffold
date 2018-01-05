import * as fs from 'fs'
import * as path from 'path'
import IScaffold from './index'
import * as glob from 'glob'
import * as handlebars from 'handlebars'

class SimpleScaffold {
  private config: IScaffold.IConfig
  private locals = {} as any

  constructor(config: IScaffold.IConfig) {
    const DefaultConfig: IScaffold.IConfig = {
      name: 'scaffold',
      templates: [],
      output: process.cwd(),
    }

    this.config = (Object as any).assign({}, DefaultConfig, config)

    const DefaultLocals = {
      Name: this.config.name![0].toUpperCase() + this.config.name!.slice(1),
      name: this.config.name![0].toLowerCase() + this.config.name!.slice(1)
    }

    this.locals = (Object as any).assign({}, DefaultLocals, config.locals)

    // console.info('Config loaded:', this.config)
  }

  private parseLocals(text: string): string {
    const template = handlebars.compile(text, {
      noEscape: true
    })
    return template(this.locals)
  }

  private *fileList(input: string[]): IterableIterator<IScaffold.IFileRepr> {
    console.info('input:', input)
    for (const checkPath of input) {
      const files = glob.sync(checkPath).map(g => path.resolve(g))
      const idx = checkPath.indexOf('*')
      let cleanCheckPath = checkPath
      if (idx >= 0) {
        cleanCheckPath = checkPath.slice(0, idx - 1)
      }
      for (const file of files) {
        yield {base: cleanCheckPath, file}
      }
    }
  }

  private getFileContents(filePath: string): string {
    return fs.readFileSync(filePath).toString()
  }

  private getOutputPath(file: string, basePath: string): string {
    let out

    if (typeof this.config.output === 'function') {
      out = this.config.output(file, basePath)
    } else {
      const outputDir = this.config.output + `/${this.config.name}/`
      const idx = file.indexOf(basePath)
      let relativeFilePath = file
      if (idx >= 0) {
        // console.info('file:', {file, idx, basePath})
        relativeFilePath = file.slice(idx + basePath.length + 1)
      }
      out = outputDir + relativeFilePath
    }

    return this.parseLocals(out)
  }

  private writeFile(filePath: string, fileContents: string): void {
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath))
    }
    console.info('Writing file:', filePath)
    fs.writeFileSync(filePath, fileContents, { encoding: 'utf-8' })
  }

  public run(): void {
    const templates = this.fileList(this.config.templates)

    console.info('Templates input:', templates)
    console.info('Locals:', this.locals)

    let fileConf
    while (fileConf = templates.next().value) {
      const {file, base} = fileConf
      const outputPath = this.getOutputPath(file, base)
      const contents = this.getFileContents(file)
      const outputContents = this.parseLocals(contents)

      this.writeFile(outputPath, outputContents)
      console.info('Parsing:', {file, base, outputPath, outputContents: outputContents.replace("\n", "\\n")})
    }
  }
}

export default SimpleScaffold
