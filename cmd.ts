import SimpleScaffold from './scaffold'
import * as fs from 'fs'
import IScaffold from './index'
import * as cliArgs from 'command-line-args'
import * as cliUsage from 'command-line-usage'
import * as path from 'path'

type Def = cliArgs.OptionDefinition & { description?: string, typeLabel?: string }

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

function booleanParser(text: string) {
  return text && text.trim().length ? ['true', '1', 'on'].includes(text.trim()) : true
}

const defs: Def[] = [
  {
    name: 'name',
    alias: 'n',
    type: String,
    description: 'Component output name',
    defaultOption: true,
  },
  {
    name: 'templates',
    alias: 't',
    type: filePathParser,
    typeLabel: '{underline File}[]',
    description: `A glob pattern of template files to load.\nA template file may be of any type and extension, and supports Handlebars as a parsing engine for the file names and contents, so you may customize both with variables from your configuration.`,
    multiple: true,
  },
  {
    name: 'output',
    alias: 'o',
    type: filePathParser,
    typeLabel: '{underline File}[]',
    description: `The output directory to put the new files in. They will attempt to maintain their regular structure as they are found, if possible.`,
    multiple: true,
  },
  {
    name: 'locals',
    alias: 'l',
    description: `A key-value map for the template to use in parsing.`,
    multiple: true,
    typeLabel: '{underline Key=Value}[]',
    type: localsParser,
  },
  {
    name: 'create-sub-folder',
    alias: 'S',
    typeLabel: '{underline Boolean}',
    description: 'Whether to create a subdirectory with \\{\\{Name\\}\\} in the {underline output} directory. {bold default=true}',
    type: booleanParser,
    defaultValue: true,
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this help message',
  },
]

const args = cliArgs(defs, { camelCase: true })

const help = [
  { header: 'Scaffold Generator', content: `Generate scaffolds for your project based on file templates.\nUsage: {bold simple-scaffold} {underline scaffold-name} {underline [options]}` },
  { header: 'Options', optionList: defs }
]

args.locals = (args.locals || []).reduce((all: object, cur: object) => ({ ...all, ...cur }), {} as IScaffold.Config['locals'])
if (args.createSubFolder === null) {
  args.createSubFolder = true
}

if (args.help || !args.name) {
  console.log(cliUsage(help))
  process.exit(0)
}

console.info('Config:', args)
new SimpleScaffold({
  name: args.name,
  templates: args.templates,
  output: args.output,
  locals: args.locals,
  createSubfolder: args.createSubFolder,
}).run()
