import SimpleScaffold from './scaffold'
import * as fs from 'fs'
import IScaffold from './index'
import * as cliArgs from 'command-line-args'
import * as cliUsage from 'command-line-usage'
import * as path from 'path'

type Def = cliArgs.OptionDefinition & { description?: string }

function localsParser(content: string) {
  const [key, value] = content.split('=')
  return { [key]: value }
}

function filePathParser(content: string) {
  if (content.startsWith('/')) {
    return content
  }
  return [process.cwd(), content].join(path.sep)
}

const defs: Def[] = [
  { name: 'name', alias: 'n', type: String, description: 'Component output name', defaultOption: true },
  { name: 'templates', alias: 't', type: filePathParser, multiple: true },
  { name: 'output', alias: 'o', type: filePathParser, multiple: true },
  { name: 'locals', alias: 'l', multiple: true, type: localsParser },
  { name: 'create-sub-folder', alias: 'S', type: (text: string) => text && text.trim().length ? ['true', '1', 'on'].includes(text.trim()) : true },
  { name: 'help', alias: 'h', type: Boolean, description: 'Display this help message' },
]

const args = cliArgs(defs, { camelCase: true })

const help = [
  { header: 'Scaffold Generator', content: 'Generate scaffolds for your project based on file templates.' },
  { header: 'Options', optionList: defs }
]

args.locals = (args.locals || []).reduce((all: object, cur: object) => ({ ...all, ...cur }), {} as IScaffold.Config['locals'])
if (args.createSubFolder === null) {
  args.createSubFolder = true
}
console.info('Config:', args)

if (args.help || !args.name) {
  console.log(cliUsage(help))
  process.exit(0)
}

new SimpleScaffold({
  name: args.name,
  templates: args.templates,
  output: args.output,
  locals: args.locals,
  createSubfolder: args.createSubFolder,
}).run()
