import * as fs from "fs"
import * as path from "path"
import { IScaffold } from "./index.d"
import * as glob from "glob"
import * as handlebars from "handlebars"

class SimpleScaffold {
  public config: IScaffold.Config
  public locals: IScaffold.Config["locals"] = {} as any

  constructor(config: IScaffold.Config) {
    const DefaultConfig: IScaffold.Config = {
      name: "scaffold",
      templates: [],
      output: process.cwd(),
      createSubfolder: true,
      overwrite: true,
    }

    this.config = { ...DefaultConfig, ...config }

    const DefaultLocals = {
      // TODO improve
      Name: this.config.name![0].toUpperCase() + this.config.name!.slice(1),
      name: this.config.name![0].toLowerCase() + this.config.name!.slice(1),
    }

    this.locals = { ...DefaultLocals, ...config.locals }
  }

  private parseLocals(text: string): string {
    try {
      const template = handlebars.compile(text, {
        noEscape: true,
      })
      return template(this.locals)
    } catch (e) {
      console.warn("Problem using Handlebars, returning unmodified content")
      return text
    }
  }

  private fileList(input: string[]): IScaffold.FileRepr[] {
    const output: IScaffold.FileRepr[] = []
    for (const checkPath of input) {
      const files = glob
        .sync(checkPath, { dot: true })
        .map((g) => (g[0] == "/" ? g : path.join(process.cwd(), g)))
      const idx = checkPath.indexOf("*")
      let cleanCheckPath = checkPath
      if (idx >= 0) {
        cleanCheckPath = checkPath.slice(0, idx - 1)
      }
      for (const file of files) {
        output.push({ base: cleanCheckPath, file })
      }
    }
    return output
  }

  private getFileContents(filePath: string): string {
    console.log(fs.readFileSync(filePath))
    return fs.readFileSync(filePath).toString()
  }

  private getOutputPath(file: string, basePath: string): string {
    let out: string

    if (typeof this.config.output === "function") {
      out = this.config.output(file, basePath, path.basename(file))
    } else {
      const outputDir =
        this.config.output +
        (this.config.createSubfolder ? `/${this.config.name}/` : "/")
      const idx = file.indexOf(basePath)
      let relativeFilePath = file
      if (idx >= 0) {
        if (file !== basePath) {
          relativeFilePath = file.slice(idx + basePath.length + 1)
        } else {
          relativeFilePath = path.basename(file)
        }
      }
      out = outputDir + relativeFilePath
    }

    return this.parseLocals(out)
  }

  private writeFile(filePath: string, fileContents: string): void {
    const baseDir = path.dirname(filePath)
    this.writeDirectory(baseDir, filePath)
    fs.writeFile(filePath, fileContents, { encoding: "utf-8" }, (err) => {
      if (err) {
        throw err
      }
    })
  }

  private shouldWriteFile(filePath: string) {
    const overwrite =
      typeof this.config.overwrite === "boolean"
        ? this.config.overwrite
        : this.config.overwrite?.(filePath)
    const exists = fs.existsSync(filePath)

    return !exists || overwrite !== false
  }

  public run(): void {
    console.log(`Generating scaffold: ${this.config.name}...`)
    const templates = this.fileList(this.config.templates)

    let fileConf,
      count = 0

    console.log("Template files:", templates)
    for (fileConf of templates) {
      let outputPath, contents, outputContents, file, base
      try {
        count++
        file = fileConf.file
        base = fileConf.base
        outputPath = this.getOutputPath(file, base)
        if (fs.lstatSync(file).isDirectory()) {
          this.writeDirectory(outputPath, file)
          continue
        }
        contents = this.getFileContents(file)
        outputContents = this.parseLocals(contents)
        if (this.shouldWriteFile(outputPath)) {
          console.info("Writing:", {
            file,
            base,
            outputPath,
            outputContents: outputContents.replace("\n", "\\n"),
          })
          this.writeFile(outputPath, outputContents)
        } else {
          console.log(`Skipping file ${outputPath}`)
        }
      } catch (e) {
        console.error("Error while processing file:", {
          file,
          base,
          contents,
          outputPath,
          outputContents,
        })
        throw e
      }
    }

    if (!count) {
      throw new Error("No files to scaffold!")
    }

    console.log("Done")
  }

  private writeDirectory(outputPath: string, file: any): void {
    const parent = path.dirname(outputPath)
    if (!fs.existsSync(parent)) {
      this.writeDirectory(parent, outputPath)
    }
    if (!fs.existsSync(outputPath)) {
      console.info("Creating directory:", {
        file,
        outputPath,
      })
      fs.mkdirSync(outputPath)
    }
  }
}

export default SimpleScaffold
