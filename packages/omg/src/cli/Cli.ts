import * as fs from 'fs'
import * as path from 'path'
import * as YAML from 'yamljs'
import * as utils from '../utils'
import ora from '../ora'
import Build from '../commands/Build'
import Subscribe from '../commands/Subscribe'
import Run from '../commands/run/Run'
import RunFactory from '../commands/run/RunFactory'
import UIServer from '../commands/ui/UI'
import * as chokidar from 'chokidar'
import {
  OMGValidate,
  Microservice,
  Action,
  Command,
  Argument
} from 'omg-validate'

/**
 * Describes the cli.
 */
export default class Cli {
  private microservice: Microservice = null
  private _run: Run = null
  private _subscribe: Subscribe = null
  private startedID: string
  private uiServer: UIServer = null
  private raw: boolean = false

  /**
   * Build an {@link Cli}.
   */
  constructor() {
    if (
      (!fs.existsSync(path.join(process.cwd(), 'microservice.yml')) ||
        !fs.existsSync(path.join(process.cwd(), 'Dockerfile'))) &&
      !process.argv.includes('--help') &&
      !process.argv.includes('-h') &&
      !process.argv.includes('--version') &&
      !process.argv.includes('-V') &&
      !process.argv.includes('-v') &&
      process.argv.length > 2
    ) {
      utils.error(
        'Must be ran in a directory with a `Dockerfile` and a `microservice.yml`'
      )
      process.exit(1)
    }
  }

  /**
   * Checks if Docker is running by running `docker ps`.
   */
  static async checkDocker() {
    try {
      await utils.docker.ping()
    } catch (e) {
      utils.error('Docker must be running to use the cli')
      process.exit(1)
    }
  }

  /**
   * Builds a {@link Microservice} based ton the `microservice.yml` file. If the build throws an error the user
   * will be directed to run `omg validate`.
   */
  buildMicroservice(): void {
    try {
      const json = YAML.parse(
        fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString()
      )
      this.microservice = new Microservice(json)
    } catch (e) {
      Cli.validate({})
    }
  }

  /**
   * Prints helpful information for a action.
   *
   * @param {String} actionName The given action name
   */
  public actionHelp(actionName: string): void {
    const action: Action = this.microservice.getAction(actionName)
    if (action.events) {
      utils.error(
        `The action \`${
          action.name
        }\` is an event action and must be called using \`omg subscribe\`. Try running \`omg subscribe ${
          action.name
        } --help\``
      )
      process.exit(1)
    }
    const stringBuffer = []
    const padding = '    '

    this.helpForActionHeader(action, stringBuffer)
    this.helpForArguments(action.arguments, stringBuffer, padding)
    this.helpForActionFooter(action, stringBuffer, padding)

    utils.log(stringBuffer.join(''))
    process.exit()
  }

  /**
   * Prtin helpful information for an event action.
   *
   * @param {String} actionName The given event action name
   */
  public eventActionHelp(actionName: string): void {
    const action: Action = this.microservice.getAction(actionName)
    const stringBuffer = []

    this.helpForActionHeader(action, stringBuffer)
    stringBuffer.push(
      `\n    Events: (run in the form of \`omg subscribe ${
        action.name
      } \`event\`\`)\n`
    )
    const padding = '          '
    for (const event of action.events) {
      stringBuffer.push(`      - ${action.name}`)
      this.helpForArguments(event.arguments, stringBuffer, padding)
      this.helpForActionFooter(event, stringBuffer, padding)
    }

    utils.error(stringBuffer.join(''))
    process.exit()
  }

  /**
   * Add the given action's header to the given string buffer.
   *
   * @param {Action} action The given {@link Action}
   * @param {Array<String>} stringBuffer  The given string buffer
   */
  private helpForActionHeader(action: Action, stringBuffer: string[]) {
    stringBuffer.push(`  Action \`${action.name}\` details: \n`)
    if (action.help) {
      stringBuffer.push(`\n    Help: ${action.help}\n`)
    }
  }

  /**
   * Add the given action's footer to the given string buffer.
   *
   * @param {Command} command The given {@link Command}, {@link Action} or {@link Event}
   * @param {Array<String>} stringBuffer The givens string buffer
   * @param {String} padding The given padding
   */
  private helpForActionFooter(
    command: Command,
    stringBuffer: string[],
    padding: string
  ) {
    if (command.output && command.output.type) {
      stringBuffer.push(
        `${padding}Output:\n${padding}  type: ${command.output.type}`
      )
    }
  }

  /**
   * Add the help for given arguments to the given string buffer.
   *
   * @param {Array<Argument>} _arguments The given list of {@link Argument}s
   * @param {Array<String>} stringBuffer The given string buffer
   * @param {String} padding The given padding
   */
  private helpForArguments(
    _arguments: Argument[],
    stringBuffer: string[],
    padding: string
  ) {
    if (_arguments.length !== 0) {
      stringBuffer.push(
        `\n${padding}Arguments: (use in the form of \`-a 'foo=bar' -a 'veggie=carrot'\`)\n`
      )
    }
    for (const argument of _arguments) {
      stringBuffer.push(
        `${padding}  - ${argument.name}        ${argument.type}${
          argument.help ? `, ${argument.help}` : ''
        }\n`
      )
    }
  }

  /**
   * Formats the output based on the data and options.
   *
   * @param {Object} data The given data of the validation
   * @param {Object} options The given options (json, silent, or text)
   * @return {String} The string to be printed to the console
   */
  private static processValidateOutput(data: any, options: any): string {
    if (options.json) {
      return JSON.stringify(data, null, 2)
    } else if (options.silent) {
      return ''
    } else {
      let errorString
      if (!data.text) {
        errorString = `${data.context} has an issue. ${data.message}`
      } else {
        errorString = data.text
      }
      if (errorString === 'No errors') {
        return errorString
      }
      const errors = errorString.split(', ')
      const errorCount = errors.length
      const formattedError = [
        `${errorCount} error${errorCount === 1 ? '' : 's'} found:`
      ]
      for (let i = 0; i < errors.length; i += 1) {
        formattedError.push(`\n  ${i + 1}. ${errors[i]}`)
      }
      return formattedError.join('')
    }
  }

  /**
   * Reads the `microservice.yml` and validates it.
   *
   * @param {Object} options The given options (json, silent, or text)
   */
  static validate(options: any): void {
    try {
      utils.log(
        new OMGValidate(
          fs
            .readFileSync(path.join(process.cwd(), 'microservice.yml'))
            .toString(),
          options
        ).validate()
      )
      process.exit(0)
    } catch (e) {
      utils.error(e)
      process.exit(1)
    }
  }

  /**
   * Builds a microservice based off of the Dockerfile in the current directory.
   *
   * @param {Object} options The given name
   */
  static async build(options: any): Promise<string> {
    await Cli.checkDocker()
    if (!options.raw) {
      ora.start().info('Building Docker image')
    }
    try {
      const name = await new Build(
        options.tag || (await utils.createImageName())
      ).go(!!options.raw)
      if (!options.raw) {
        ora.start().succeed(`Built Docker image with name: ${name}`)
      }
      return name
    } catch (e) {
      if (options.raw) {
        utils.error(e)
      } else {
        ora.start().fail(`Failed to build: ${e}`)
      }
      process.exit(1)
    }
  }

  /**
   * Will read the `microservice.yml` and `Dockerfile` and run the given command with the given arguments and environment variables.
   *
   * @param {String} action The command to run
   * @param {Object} options The given object holding the command, arguments, and environment variables
   */
  async run(action: string, options: any): Promise<void> {
    await Cli.checkDocker()
    const image = options.image
    if (!options.args || !options.envs) {
      utils.error(
        'Failed to parse command, run `omg run --help` for more information.'
      )
      process.exit(1)
      return
    }

    if (options.image) {
      if (
        !utils.doesContainerExist(
          options.image,
          await utils.docker.listImages()
        )
      ) {
        utils.error(
          `Image for microservice is not built. Run \`omg build\` to build the image.`
        )
        process.exit(1)
        return
      }
    } else {
      options.image = await Cli.build({ raw: options.raw })
    }

    let _action: Action
    let argsObj
    let envObj
    try {
      _action = this.microservice.getAction(action)
      argsObj = utils.parse(
        options.args,
        'Unable to parse arguments. Must be of form: `-a key="val"`'
      )
      envObj = utils.parse(
        options.envs,
        'Unable to parse environment variables. Must be of form: `-e key="val"`'
      )
      envObj = utils.matchEnvironmentCases(
        envObj,
        this.microservice.environmentVariables
      )
    } catch (e) {
      utils.error(e)
      process.exit(1)
    }

    this._run = new RunFactory(
      options.image,
      this.microservice,
      argsObj,
      envObj
    ).getRun(_action)
    if (
      process.argv[2] === 'run' &&
      this._run.constructor.name === 'EventRun'
    ) {
      utils.error(`Action \`${action}\` is and event. Use \`omg subscribe\``)
      process.exit(1)
    }
    let spinner
    if (!options.raw) {
      spinner = ora.start(`Starting Docker container`)
    }
    this.startedID = await this._run.startService() // 1. start service
    if (!options.raw) {
      spinner.succeed(
        `Started Docker container: ${this.startedID.substring(0, 12)}`
      )
      spinner = ora.start(`Health check`)
    }

    let isHealthy: boolean = undefined
    let tmpRetryExec: boolean = true // Temporary, remove when health is mandatory
    if (this.microservice.health) {
      try {
        isHealthy = await this._run.healthCheck()
        tmpRetryExec = false // Temporary, remove when health is mandatory
      } catch {
        isHealthy = false
      }
    }

    // if (!(await this._run.isRunning())) {
    if (isHealthy === false) {
      // 2. health check
      if (!options.raw) {
        spinner.fail('Health check failed')
      }
      // utils.error(`  Docker logs:\n${await this._run.getLogs()}`)
      if (this.microservice.health) {
        // Temporary, remove when health is mandatory
        if (this._run.constructor.name !== 'EventRun') {
          if (await this._run.isRunning()) {
            if (!options.raw) {
              spinner = ora.start(
                `Stopping Docker container: ${this.startedID.substring(0, 12)}`
              )
            }
            const stoppedID = await this._run.stopService()
            if (!options.raw) {
              spinner.succeed(
                `Stopped Docker container: ${stoppedID.substring(0, 12)}`
              )
            }
          }
        }
        process.exit(1)
      }
    }
    if (!options.raw && !tmpRetryExec) {
      spinner.succeed(`Health check passed`)
      spinner = ora.start(`Running action: \`${action}\``)
    }
    let output
    try {
      if (tmpRetryExec) {
        if (!options.raw) {
          ora.start('Executing default health check')
        }
        await utils.sleep(10)
        output = await new Promise<string>(async (resolve, reject) => {
          for (let i = 100; i > 0; i--) {
            const attempt = () => {
              return new Promise<string>((resolve, reject) => {
                this._run
                  .exec(action, tmpRetryExec)
                  .then(response => {
                    switch (response.statusCode / 100) {
                      case 2:
                      case 3:
                        resolve(response.body)
                        break
                    }
                  })
                  .catch(() => {
                    reject()
                  })
              })
            }
            await attempt()
              .then(res => {
                i = 0
                if (!options.raw) {
                  ora.succeed('Default health check passed')
                }
                resolve(res)
              })
              .catch(async () => {
                if (i === 1) {
                  if (!options.raw) {
                    ora.fail('Default health check failed')
                  }
                  reject(
                    'Action did not returned a valid HTTP response code (2xx/3xx)'
                  )
                }
                await utils.sleep(100)
              })
          }
        })
        const tmpAction = this.microservice.getAction(action)
        if (
          tmpAction.output &&
          tmpAction.output.type &&
          (tmpAction.output.type === 'map' ||
            tmpAction.output.type === 'object')
        ) {
          output = JSON.stringify(JSON.parse(output.trim()), null, 2)
        }
        output = output.trim()
      } else {
        output = await this._run.exec(action) // 3. run service
      }
      if (!options.raw) {
        spinner.succeed(`Ran action: \`${action}\` with output: ${output}`)
      }
    } catch (e) {
      if (await this._run.isRunning()) {
        await this._run.stopService()
      }
      if (options.raw) {
        utils.error(`Failed action: \`${action}\`: ${e}`)
      } else {
        spinner.fail(`Failed action: \`${action}\`: ${e}`)
      }
      process.exit(1)
    }

    if (this._run.constructor.name !== 'EventRun') {
      if (!options.raw) {
        spinner = ora.start(
          `Stopping Docker container: ${this.startedID.substring(0, 12)}`
        )
      }
      const stoppedID = await this._run.stopService()
      if (!options.raw) {
        spinner.succeed(
          `Stopped Docker container: ${stoppedID.substring(0, 12)}`
        )
      }
    }

    if (options.raw) {
      let json = {}
      try {
        json = JSON.parse(output)
        utils.log(JSON.stringify(json))
      } catch {
        utils.log(output)
      }
    }
  }

  /**
   * Will read the `microservice.yml` and `Dockerfile` and subscribe to the with the given event..
   *
   * @param {String} action The given action
   * @param {String} event The given event
   * @param {Object} options The given object holding the arguments
   */
  async subscribe(action: string, event: string, options: any) {
    await Cli.checkDocker()
    this.raw = options.raw
    await this.run(action, { args: [], envs: options.envs, raw: options.raw })
    let spinner
    if (!options.raw) {
      spinner = ora.start(`Subscribing to event: \`${event}\``)
    }
    let argsObj
    try {
      argsObj = utils.parse(
        options.args,
        'Unable to parse arguments. Must be of form: `-a key="val"`'
      )
    } catch (e) {
      if (!options.raw) {
        spinner.fail(`Failed action: \`${action}\`: ${e}`)
      }
      process.exit(1)
    }
    this._subscribe = new Subscribe(this.microservice, argsObj, this._run)
    try {
      await this._subscribe.go(action, event)
      if (!options.raw) {
        spinner.succeed(
          `Subscribed to event: \`${event}\` data will be posted to this terminal window when appropriate`
        )
      }
      setInterval(async () => {
        if (!(await this._run.isRunning())) {
          utils.error(
            `\n\nContainer unexpectedly stopped\nDocker logs:\n${await this._run.getStderr()}`
          )
          process.exit(1)
        }
      }, 1500)
    } catch (e) {
      if (await this._run.isRunning()) {
        await this._run.stopService()
      }
      const logs = await this._run.getStderr()
      if (!options.raw) {
        spinner.fail(`Failed subscribing to event \`${event}\`: ${e}`)
      }
      if (logs) {
        utils.error(`  Docker logs:\n${await this._run.getStderr()}`)
      }
      process.exit(1)
    }
  }

  /**
   * Builds a microservice based off of the Dockerfile in the current directory.
   *
   * @param {Object} options The options to start the UI, such as port mapping
   */
  async ui(options: any): Promise<any> {
    await Cli.checkDocker()
    try {
      this.uiServer = new UIServer(
        options,
        Cli.readYAML(path.join(process.cwd(), 'microservice.yml'), true)
      )
      this.uiServer.startUI(options.open ? true : false)

      chokidar
        .watch(process.cwd(), {
          ignored: /(^|[/\\])\../
        })
        .on('all', (event, appPath) => {
          if (event === 'change') {
            this.uiServer.rebuild(
              {},
              Cli.readYAML(path.join(process.cwd(), 'microservice.yml'), true),
              true,
              appPath
            )
          }
        })
    } catch (e) {
      utils.error(e)
      process.exit(1)
    }
  }
  /**
   * @param  {any} el Given action to parse from microservice
   * @param  {string} method Given HTTP method
   */
  private httpList(el: any, method: string) {
    let req = `:${el.http.port}${el.http.path}?`
    const body = {}
    el.arguments.forEach(arg => {
      if (arg.in === 'query') {
        req = `${req}${arg.name}=<arg>&`
      } else if (arg.in === 'requestBody') {
        body[arg.name] = arg.type
      }
    })
    utils.log(`${method.toUpperCase()} ${req} `)
    let bodyStr = ''
    try {
      bodyStr = JSON.stringify(body, null, 4)
    } catch (e) {
      utils.error('Failed parsing body requirements')
      process.exit(1)
    }
    utils.log(bodyStr)
  }
  /**
   * @param  {any} options Provided options for 'list' action
   */
  list(options: any): void {
    const json = Cli.readYAML(path.join(process.cwd(), 'microservice.yml'))
    try {
      utils.checkActionInterface(json)
      const m = new Microservice(json)
      Cli.processValidateOutput(m.rawData, options)
      if (options.json) {
        utils.log(JSON.stringify(m.actions))
      } else if (options.details) {
        m.actions.forEach(a => {
          utils.log(`${a.name}: ${a.help ? a.help : 'No help provided'}`)
          const method = `${a.http ? 'http' : 'format'}`
          if (a.http) {
            this.httpList(a, method)
          } else if (a.events) {
            a.events.forEach(e => {
              utils.log(`  ${e.name}: ${e.help ? e.help : 'No help provided'}`)
              utils.log(
                `    ${e.subscribe.method.toUpperCase()} :${e.subscribe.port}${
                  e.subscribe.path
                }`
              )
              utils.log(
                `    ${e.unsubscribe.method.toUpperCase()} :${
                  e.unsubscribe.port
                }${e.unsubscribe.path}`
              )
            })
          }
          utils.log('')
        })
      } else {
        m.actions.forEach(a => {
          utils.log(`${a.name}: ${a.help ? a.help : 'No help provided'}`)
        })
      }
      process.exit(0)
    } catch (e) {
      utils.error(Cli.processValidateOutput(e, options))
      process.exit(1)
    }
  }

  /**
   * Catch the `CtrlC` command to stop running containers.
   */
  async controlC() {
    if (this.uiServer !== null) {
      await this.uiServer.removeListeners()
      await this.uiServer.stopContainer()
      await this.uiServer.removeContainer()
      setTimeout(() => {
        process.exit(0)
      }, 3000) // Lil timeout to serve the last statics before shutting down
    }
    let spinner
    if (!this.raw) {
      spinner = ora.start(
        `Stopping Docker container: ${this.startedID.substring(0, 12)}`
      )
    }
    if (this._subscribe) {
      await this._subscribe.unsubscribe()
    }
    if (this._run && this._run.isDockerProcessRunning()) {
      await this._run.stopService()
    }
    if (!this.raw) {
      spinner.succeed(
        `Stopped Docker container: ${this.startedID.substring(0, 12)}`
      )
    }
    process.exit()
  }

  /**
   * Read's a `microservice.yml` file to a string.
   *
   * @param {String} path The given path
   * @param {boolean} [ui=false] The given boolean if ui mode is enabled or not
   * @return {String} Returns file in string form
   */
  private static readYAML(path: string, ui = false): string {
    try {
      return YAML.parse(fs.readFileSync(path).toString())
    } catch (e) {
      if (ui) {
        return 'ERROR_PARSING'
      } else {
        utils.error(`Issue with microservice.yml: ${e.message}`)
        process.exit(1)
      }
    }
  }
}
