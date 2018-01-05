import Scaffolder from './scaffold'
import * as fs from 'fs'
import IScaffold from './index'

const args = process.argv.slice(2)

class ScaffoldCmd {
  constructor() {
    console.log(this.getOptionsFromArgs())
  }

  private getOptionsFromArgs() {
    let skipNext = false
    const options = {} as any

    args.forEach((arg, i) => {
      if (skipNext) {
        skipNext = false
        return
      }

      if (arg.slice(0, 2) == '--') {
        skipNext = true
        let value: string

        if (arg.indexOf('=') >= 0) {
          value = arg.split('=').slice(1).join('')
        } else if (args.length >= i + 1 && args[i + 1] && args[i + 1].slice(0, 2) !== '--') {
          value = args[i + 1]
        } else {
          value = 'true'
        }

        const argName = arg.slice(2)
        options[argName] = this.getArgValue(argName, value, options)
      }
    })

    return options
  }

  private getArgValue(arg: string, value: string, options: IScaffold.IConfig) {
    switch (arg) {
      case 'template':
        return (options.templates || []).concat([value])
      case 'output':
        return value
      case 'locals':
        const split = value.split(',')
        const locals = options.locals || {}
        for (const item of split) {
          const [k, v] = item.split('=')
          locals[k] = v
        }
      default:
        throw TypeError(`arguments invalid for config: arg=\`${arg}\`, value=\`${value}\``)
    }
  }

  private run(config: IScaffold.IConfig) {
    const scf = new Scaffolder({
      templates: config.templates,
      output: config.output,
      locals: config.locals,
    }).run()
  }
}

new ScaffoldCmd()
