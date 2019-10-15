import fs from 'fs'
import Run from './Run'

const homedir = require('os').homedir()

/**
 * Represents a execution of an {@link Action}'s {@link Event}.
 */
export default class EventRun extends Run {
  /**
   * Builds an {@link EventRun}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables The given environment map
   */

  /** @inheritdoc */
  public async exec(action): Promise<string> {
    this.action = this.microservice.getAction(action)
    this.preChecks()
    this.verification()
    this.omsJsonFileHandler()
    return ''
  }

  /**
   * Handle the `.oms.json` state file.
   */
  private omsJsonFileHandler(): void {
    let data = {}
    if (fs.existsSync(`${homedir}/.oms.json`)) {
      data = JSON.parse(fs.readFileSync(`${homedir}/.oms.json`).toString())
    }

    data[process.cwd()] = {
      container_id: this.containerID,
      ports: {},
    }

    const neededPorts = Object.keys(this.portMap)
    for (let i = 0; i < neededPorts.length; i += 1) {
      data[process.cwd()].ports[neededPorts[i]] = this.portMap[neededPorts[i]]
    }
    fs.writeFileSync(`${homedir}/.oms.json`, JSON.stringify(data), 'utf8')
  }

  /** @inheritdoc */
  public isDockerProcessRunning(): boolean {
    return this.containerID !== null
  }

  /**
   * @param  {any} args
   */
  public setArgs(args: any) {}
}
