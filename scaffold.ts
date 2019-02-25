import * as fs from 'fs'
import * as path from 'path'
import IScaffold from './index'
import * as glob from 'glob'
import * as handlebars from 'handlebars'

class SimpleScaffold {
  public config: IScaffold.Config
  public locals: IScaffold.Config['locals'] = {} as any

  constructor(config: IScaffold.Config) {
    const DefaultConfig: IScaffold.Config = {
      name: 'scaffold',
      templates: [],
      output: process.cwd(),
      createSubfolder: true,
    }

    this.config = { ...DefaultConfig, ...config }

    const DefaultLocals = {
      Name: this.config.name![0].toUpperCase() + this.config.name!.slice(1),
      name: this.config.name![0].toLowerCase() + this.config.name!.slice(1)
    }

    this.locals = { ...DefaultLocals, ...config.locals }
  }

  private parseLocals(text: string): string {
    const template = handlebars.compile(text, {
      noEscape: true
    })
    return template(this.locals)
  }

  private *fileList(input: string[]): IterableIterator<IScaffold.FileRepr> {
    for (const checkPath of input) {
      const files = glob.sync(checkPath).map(g => g[0] == '/' ? g : path.join(process.cwd(), g))
      const idx = checkPath.indexOf('*')
      let cleanCheckPath = checkPath
      if (idx >= 0) {
        cleanCheckPath = checkPath.slice(0, idx - 1)
      }
      for (const file of files) {
        yield { base: cleanCheckPath, file }
      }
    }
  }

  private getFileContents(filePath: string): string {
    console.log(fs.readFileSync(filePath))
    return fs.readFileSync(filePath).toString()
  }

  private getOutputPath(file: string, basePath: string): string {
    let out: string

    if (typeof this.config.output === 'function') {
      out = this.config.output(file, basePath)
    } else {
      const outputDir = this.config.output + (this.config.createSubfolder ? `/${this.config.name}/` : '/')
      const idx = file.indexOf(basePath)
      let relativeFilePath = file
      if (idx >= 0) {
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
    console.log(`Generating scaffold: ${this.config.name}...`)
    const templates = this.fileList(this.config.templates)

    let fileConf, count = 0
    while (fileConf = templates.next().value) {
      count++
      const { file, base } = fileConf
      const outputPath = this.getOutputPath(file, base)
      const contents = this.getFileContents(file)
      const outputContents = this.parseLocals(contents)

      this.writeFile(outputPath, outputContents)
      console.info('Parsing:', { file, base, outputPath, outputContents: outputContents.replace("\n", "\\n") })
    }

    if (!count) {
      throw new Error('No files to scaffold!')
    }

    console.log('Done')
  }
}

export default SimpleScaffold
