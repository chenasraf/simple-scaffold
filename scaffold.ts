import * as fs from 'fs'
import * as path from 'path'
import { IScaffold } from './index'

class SimpleScaffold {
  private config: IScaffold.IConfig
  private locals = {} as any
  public scaffoldName = process.argv[2]
  private DefaultConfig: IScaffold.IConfig = {
    templates: [],
    output: path.resolve(process.cwd()),
    locals: {
      Name: this.scaffoldName[0].toUpperCase() + this.scaffoldName.slice(1),
      name: this.scaffoldName[0].toLowerCase() + this.scaffoldName.slice(1)
    }
  }

  constructor(config: IScaffold.IConfig) {
    // this.config = utils.merge<IScaffold.IConfig>(this.DefaultConfig, config)
    if (!this.scaffoldName) {
      throw new Error('Must provide scaffold name')
    }
    this.config = (Object as any).assign({}, this.DefaultConfig, config)
    this.locals = (Object as any).assign({}, this.DefaultConfig.locals, config.locals)
    console.info('Config loaded:', this.config)
    console.info('Locals:', this.locals)
  }

  private parseLocals(text: string): string {
    let out = text.toString()
    const pattern = /{[%]\s*([^%{}]+)\s*[%]}/gi
    return out.replace(pattern, (match: string, $1: string) => this.locals[$1])
  }

  private getFileList(pathList: string[]): string[] {
    let outList: string[] = []

    pathList.forEach((checkPath: string) => {
      const stat = fs.lstatSync(checkPath)
      if (stat.isFile()) {
        console.info('pushing', checkPath)
        outList.push(checkPath)
      } else if (stat.isDirectory()) {
        console.info('going into dir', checkPath)
        const innerFiles = fs.readdirSync(checkPath).map(p => path.join(checkPath, p))
        outList = outList.concat(this.getFileList(innerFiles))
      }
    })

    return outList
  }

  private getFileContents(filePath: string): string {
    return fs.readFileSync(filePath).toString()
  }

  private getOutputPath(file: string): string {
    let out

    if (typeof this.config.output === 'function') {
      out = this.config.output(file)
    } else {
      out = this.config.output + `/${this.scaffoldName}/` + path.basename(file)
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

  public run() {
    const inputFiles = this.getFileList(this.config.templates)
    console.info(inputFiles)
    inputFiles.forEach((file: string) => {
      const outputPath = this.getOutputPath(file)
      const contents = this.getFileContents(file)
      const outputContents = this.parseLocals(contents)
      this.writeFile(outputPath, outputContents)
    })
  }
}

exports.default = SimpleScaffold
