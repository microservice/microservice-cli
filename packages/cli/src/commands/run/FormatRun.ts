import Run from './Run'
import * as utils from '../../utils'
import * as verify from '../../verify'

/**
 * Represents a docker exec execution of an {@link Action}.
 */
export default class FormatRun extends Run {
  /**
   * Builds a {@link FormatRun}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables the given environment  map
   */

  /** @inheritdoc */
  public async exec(action: string): Promise<string> {
    this.action = this.microservice.getAction(action)
    this.preChecks()
    this.verification()
    const output = await this.runDockerExecCommand(this.containerID)
    verify.verifyOutputType(this.action, output)
    if (
      this.action.output &&
      this.action.output.type &&
      (this.action.output.type === 'map' || this.action.output.type === 'object')
    ) {
      if (this.action.output.properties) {
        verify.verifyProperties(this.action, output)
      }
      return JSON.stringify(JSON.parse(output.trim()), null, 2)
    }
    return output.trim()
  }

  /**
   * Starts the docker container based of this {@link Exec}'s {@link Microservice}'s {@link Lifecycle}. If null,
   * the container will be started with the command: `tail -f /dev/null``.
   *
   * @return {Promise<String>} The id of the started container
   */
  public async startService(): Promise<string> {
    this.setDefaultEnvironmentVariables()
    const { lifecycle } = this.microservice
    if (lifecycle !== null && lifecycle.startup !== null) {
      const container = await utils.docker.createContainer({
        Image: this.dockerImage,
        Cmd: lifecycle.startup,
        Env: this.formatEnvironmentVariables(),
      })
      await container.start()
      this.containerID = container.$subject.id
    } else {
      const container = await utils.docker.createContainer({
        Image: this.dockerImage,
        Cmd: ['tail', '-f', '/dev/null'],
        Env: this.formatEnvironmentVariables(),
      })
      await container.start()
      this.containerID = container.$subject.id
    }
    return this.containerID
  }

  /**
   * Runs a given command via Docker API.
   *
   * @param {String} containerID The given id of the docker container
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   */
  private async runDockerExecCommand(containerID: string): Promise<string> {
    const container = utils.docker.getContainer(this.containerID)
    const cmd = this.action.format.command
    cmd.push(this.formatExec())
    const exec = await container.exec({
      Cmd: cmd,
      AttachStdin: true,
      AttachStdout: true,
      Tty: true,
    })

    const data = await new Promise((resolve, reject) => {
      exec.start({ stdin: true, stdout: true }, (err, stream) => {
        const chunks = []
        if (err) {
          throw err
        } else {
          stream.on('data', chunk => {
            chunks.push(chunk)
          })
          stream.on('end', () => {
            resolve(
              Buffer.concat(chunks)
                .toString()
                .trim()
                .substring(8),
            )
          })
        }
      })
    })

    if ((await exec.inspect()).ExitCode !== 0) {
      throw data
    }

    return data as string
  }

  /**
   * Formats this {@link Microservice}'s {@link Argument}s into stringified JSON.
   *
   * @return {String} The JSON string
   * @private
   */
  private formatExec(): string {
    if (this.action.arguments.length > 0) {
      return JSON.stringify(this._arguments)
    }
    return ''
  }

  /**
   * @param  {any} args
   */
  public setArgs(args: any) {}
}
