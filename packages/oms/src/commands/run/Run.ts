import rp from 'request-promise'
import $ from 'shelljs'
import { Action, Microservice } from 'oms-validate'
import * as verify from '../../verify'
import * as utils from '../../utils'

/**
 * Used to represent a way to execute a {@link Microservice}'s {@link Action}s.
 */
export default abstract class Run {
  protected portMap: any = {}
  protected exposedPorts: any = {}
  protected portBindings: any = {}
  protected dockerImage: string
  protected microservice: Microservice
  protected _arguments: any
  protected environmentVariables: any
  protected dockerServiceId: string
  protected action: Action
  protected containerID: string = null

  /**
   * Use to help build a {@link FormatRun}, {@link HttpRun}, or an {@link EventRun}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The argument map
   * @param {Object} environmentVariables The environment map
   */
  public constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    this.dockerImage = dockerImage
    this.microservice = microservice
    this._arguments = _arguments
    this.environmentVariables = environmentVariables
    this.dockerServiceId = null
    this.action = null
  }

  /**
   * Checks if required arguments and environment variables are given and will also set their default values.
   */
  protected preChecks() {
    this.setDefaultArguments()
    if (!this.action.areRequiredArgumentsSupplied(this._arguments)) {
      throw `Need to supply required arguments: \`${this.action.requiredArguments.toString()}\``
    }
    if (!this.microservice.areRequiredEnvironmentVariablesSupplied(this.environmentVariables)) {
      throw `Need to supply required environment variables: \`${this.microservice.requiredEnvironmentVariables.toString()}\``
    }
  }

  /**
   * Runs verification on arguments and environment variables.
   */
  protected verification() {
    verify.verifyArgumentTypes(this.action, this._arguments)
    this.castTypes()
    verify.verifyArgumentConstrains(this.action, this._arguments)

    verify.verifyEnvironmentVariableTypes(this.microservice, this.environmentVariables)
    verify.verifyEnvironmentVariablePattern(this.microservice, this.environmentVariables)
  }

  /**
   * Sets a {@link Action}'s default arguments.
   */
  private setDefaultArguments(): void {
    for (let i = 0; i < this.action.arguments.length; i += 1) {
      const argument = this.action.arguments[i]
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          if (typeof argument.default === 'object') {
            this._arguments[argument.name] = JSON.stringify(argument.default)
          } else {
            this._arguments[argument.name] = `${argument.default}`
          }
        }
      }
    }
  }

  /**
   * Sets a {@link Microservice}'s default {@link EnvironmentVariable}s and variables from the system environment variables.
   *
   * @param {boolean} [inheritEnv=false] Boolean that allows to get env from host env or not
   */
  protected setDefaultEnvironmentVariables(inheritEnv?: boolean): void {
    for (let i = 0; i < this.microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this.microservice.environmentVariables[i]
      if (!this.environmentVariables[environmentVariable.name]) {
        if (environmentVariable.default !== null) {
          this.environmentVariables[environmentVariable.name] = environmentVariable.default
        }
      }
    }

    if (inheritEnv) {
      for (let i = 0; i < this.microservice.environmentVariables.length; i += 1) {
        const environmentVariable = this.microservice.environmentVariables[i]
        if (process.env[environmentVariable.name]) {
          this.environmentVariables[environmentVariable.name] = process.env[environmentVariable.name]
        }
      }
    }
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   */
  protected castTypes(): void {
    const argumentList = Object.keys(this._arguments)
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this.action.getArgument(argumentList[i])
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name])
    }
  }

  /**
   * Formats an object of environment variables to a `-e KEY='val'` style.
   *
   * @return {String} The formatted string
   */
  protected formatEnvironmentVariables(): string[] {
    const result = []
    const keys = Object.keys(this.environmentVariables)
    for (let i = 0; i < keys.length; i += 1) {
      result.push(`${keys[i]}=${this.environmentVariables[keys[i]]}`)
    }
    return result
  }

  /**
   * Checks it a Docker process is running.
   *
   * @return {Boolean} True if a Docker process is running, otherwise false
   */
  // TODO: WUT? 😅
  // eslint-disable-next-line
  public isDockerProcessRunning(): boolean {
    return false
  }

  /**
   * Executes the given {@link Action} and returns the output.
   *
   * @param {String} action The given action
   * @return {String} The output
   */
  public abstract async exec(action: string, tmpRetryExec?: boolean): Promise<any> // Temporary, remove when health is mandatory

  /**
   * Sets provided arguments
   *
   * @param  {any} args
   * @returns void
   */
  public abstract setArgs(args: any): void

  /**
   * @return {Promise} Return the host IP
   */
  public static getHostIp(): Promise<string> {
    const hostDomain = 'host.docker.internal'
    return new Promise<string>((resolve, reject) => {
      $.exec('ip -4 addr show docker0', { silent: true }, (code, stdout, stderr) => {
        if (code === 0) {
          resolve(`${hostDomain}:${stdout.match(/inet ([\d.]+)/)[1]}`)
        }
        reject()
      })
    })
  }
  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml and builds port mapping.
   *
   * @param {boolean} [inheritEnv=false] Boolean that allows to get env from host env or not
   * @return {String} The id of the container
   */
  public async startService(inheritEnv = false): Promise<string> {
    this.setDefaultEnvironmentVariables(inheritEnv)
    const neededPorts = utils.getNeededPorts(this.microservice)
    const openPorts = []

    let portOffset = 0
    while (neededPorts.length !== openPorts.length) {
      const possiblePort = await utils.getOpenPort(portOffset)
      if (!openPorts.includes(possiblePort)) {
        openPorts.push(possiblePort)
      }
      portOffset += 1
    }

    for (let i = 0; i < neededPorts.length; i += 1) {
      this.portMap[neededPorts[i]] = openPorts[i]
      this.exposedPorts[`${neededPorts[i]}/tcp`] = {}
      this.portBindings[`${neededPorts[i]}/tcp`] = [{ HostPort: openPorts[i].toString() }]
    }

    const container = await utils.docker.createContainer({
      Image: this.dockerImage,
      Cmd: this.microservice.lifecycle ? this.microservice.lifecycle.startup : null,
      Env: this.formatEnvironmentVariables(),
      ExposedPorts: this.exposedPorts,
      HostConfig: {
        PortBindings: this.portBindings,
        ExtraHosts: !['darwin', 'win32'].includes(process.platform) ? [await Run.getHostIp()] : [],
      },
    })
    await container.start()

    this.containerID = container.$subject.id
    return this.containerID
  }

  /**
   * Stops a running Docker service, if it is already stopped just return the id of that container.
   *
   * @return {String} The containerID that has been stopped
   */
  public async stopService(): Promise<string> {
    const container = utils.docker.getContainer(this.containerID)
    await container.kill()
    return this.containerID
  }

  /**
   * Removes a stopped Docker service
   *
   * @return {String} The containerID that has been stopped
   */
  public async removeContainer(): Promise<string> {
    const container = utils.docker.getContainer(this.containerID)
    await container.remove()
    return this.containerID
  }

  /**
   * Checks if there is a Docker process running.
   *
   * @return {Boolean} True if running, otherwise false
   */
  public async isRunning(): Promise<boolean> {
    const container = utils.docker.getContainer(this.containerID)
    return (await container.inspect()).State.Running
  }

  /**
   * Returns docker inspect result as a Promise
   *
   * @return {Promise}
   */
  public async getInspect(): Promise<any> {
    const container = utils.docker.getContainer(this.containerID)
    return container.inspect()
  }

  /**
   * Returns docker stats result as a Promise
   *
   * @return {Promise}
   */
  public async getStats(): Promise<any> {
    const container = utils.docker.getContainer(this.containerID)
    return container.stats({ stream: false })
  }

  /**
   * Gets the Docker logs.
   *
   * @return {String} The Docker logs
   */
  public async getStderr(): Promise<string> {
    const container = utils.docker.getContainer(this.containerID)
    return (await container.logs({ stderr: true })).toString().trim()
  }

  /**
   * Returns docker logs result as a Promise
   *
   * @param  {number} since Optional parameters filtering logs 'since' UNIX timestamp
   * @return {Promise}
   */
  public async getLogs(since?: number): Promise<string> {
    const container = utils.docker.getContainer(this.containerID)
    const logs = await container.logs({
      stderr: true,
      stdout: true,
      since: since !== null ? since : 0,
    })
    return logs.toString().trim()
  }

  /**
   * Gets and return bond port
   *
   * @return {any} Bond ports
   */
  public getPortbindings(): any {
    return this.portBindings
  }

  /**
   * Gets and return bond port only for forwards
   * @return {any} Bond ports
   */
  public get forwardPortsBindings(): any {
    const bindings = {}
    const ports = utils.getForwardPorts(this.microservice)
    this.microservice.forwards.forEach(forward => {
      bindings[forward.name] = {
        host: this.portBindings[`${forward.port}/tcp`],
        container: forward.port,
      }
    })
    return bindings
  }

  /**
   * Gets health status of the service
   *
   * @param  {number} boundPort port used for health checking
   * @param  {number} timeout Optionnal timeout, used during healthcheck
   * @return {Promise} Empty promise
   */
  private async isHealthy(boundPort: number, timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const promise = rp.get({
        uri: `http://localhost:${boundPort}${this.microservice.health.path}`,
        method: 'GET',
        resolveWithFullResponse: true,
      })
      if (timeout) {
        setTimeout(() => {
          reject(promise.cancel())
        }, timeout)
      }
      promise
        .then(response => {
          switch (response.statusCode / 100) {
            case 2:
            case 3:
              resolve()
              break
            default:
              reject()
              break
          }
        })
        .catch(e => {
          reject()
        })
    })
  }

  /**
   * Does health check for the service until it's healthy or unhealthy
   *
   * @return {Promise} health status as a boolean
   */
  public async healthCheck(): Promise<boolean> {
    const timeout = 500
    const interval = 100
    const retries = 100
    let boundPort = -1

    Object.keys(this.portBindings).forEach(p => {
      const port = parseInt(p.match(/[\d]*/)[0], 10)
      if (port === utils.getHealthPort(this.microservice)) {
        boundPort = this.portBindings[p][0].HostPort
      }
    })

    return new Promise(async (resolve, reject) => {
      await utils.sleep(10)
      for (let i = retries; i > 0; i -= 1) {
        if (this.microservice.health) {
          await this.isHealthy(boundPort, timeout)
            .then(() => {
              i = 0
              resolve(true)
            })
            .catch(async () => {
              await utils.sleep(interval)
            })
        }
      }
      // TODO: Fix this
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(false)
    })
  }
}
