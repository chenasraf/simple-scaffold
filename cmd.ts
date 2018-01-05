import SimpleScaffold from './scaffold'
import * as fs from 'fs'
import IScaffold from './index'

const args = process.argv.slice(2)

class ScaffoldCmd {
  private config: IScaffold.IConfig

  constructor() {
    this.config = this.getOptionsFromArgs()
  }

  private getOptionsFromArgs(): IScaffold.IConfig {
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
      } else {
        if (!options.name) {
          options.name = arg
        } else {
          throw new TypeError(`Invalid argument: ${arg}`)
        }
      }
    })

    if (!['name', 'templates', 'output'].every(o => options[o] !== undefined)) {
      throw new Error(`Config is missing keys: ${JSON.stringify(options)}`)
    }

    return options
  }

  private getArgValue(arg: string, value: string, options: IScaffold.IConfig) {
    switch (arg) {
      case 'templates':
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
        return locals
      default:
        throw TypeError(`arguments invalid for config: arg=\`${arg}\`, value=\`${value}\``)
    }
  }

  public run() {
    const config: IScaffold.IConfig = this.config
    console.info('Config:', config)

    const scf = new SimpleScaffold({
      name: config.name,
      templates: config.templates,
      output: config.output,
      locals: config.locals,
    }).run()
  }
}

new ScaffoldCmd().run()
