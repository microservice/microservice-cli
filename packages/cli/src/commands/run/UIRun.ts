import { Microservice } from 'oms-validate'
import rp from 'request-promise'
import _ from 'underscore'
import querystring from 'querystring'
import fs from 'fs'
import Run from './Run'
import * as utils from '../../utils'
import * as verify from '../../verify'

const homedir = require('os').homedir()

/**
 * Used to represent a way to execute an {@link Action} in the UI.
 */
export default class UIRun extends Run {
  /**
   * Constructor
   *
   * @param  {string} dockerImage
   * @param  {Microservice} microservice
   * @param  {any} envs
   */
  public constructor(dockerImage: string, microservice: Microservice, envs: any) {
    super(dockerImage, microservice, null, envs)
  }

  /**
   * Execs the given action
   *
   * @param  {string} action
   * @return {Promise}
   */
  public async exec(action: string): Promise<string> {
    this.action = this.microservice.getAction(action)
    this.preChecks()
    try {
      this.verification()
    } catch (e) {
      utils.error(e)
    }

    if (this.action.http === null) {
      this.omsJsonFileHandler()
      return ''
    }
    const output = await this.httpCommand(this.portMap[this.action.http.port])
    verify.verifyOutputType(this.action, output.trim())
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
   * Run this {@link HttpRun}'s {@link Action} that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @return {Promise<String>} The response of the Http request
   */
  private async httpCommand(port: number): Promise<string> {
    let data: string
    const httpData = this.formatHttp(port)
    switch (this.action.http.method) {
      case 'get':
        data = await rp.get(httpData.url)
        break
      case 'post':
        data = await rp.post(httpData.url, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(httpData.jsonData),
        })
        break
      case 'put':
        data = await rp.put(httpData.url, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(httpData.jsonData),
        })
        break
      case 'delete':
        data = await rp.delete(httpData.url)
        break
      default:
    }
    return data
  }

  /**
   * Formats an Http request based on this {@link HttpRun}'s {@link Action}.
   *
   * @param {Number} port The given server info
   * @return {{url: String, jsonData: Object}} The url and data
   */
  private formatHttp(port: number): any {
    const jsonData = {}
    const queryParams = {}
    let url = `http://localhost:${port}${this.action.http.path}`
    for (let i = 0; i < this.action.arguments.length; i += 1) {
      const argument = this.action.arguments[i]
      switch (this.action.getArgument(argument.name).in) {
        case 'query':
          if (!_.isUndefined(this._arguments[argument.name])) {
            queryParams[argument.name] = this._arguments[argument.name]
          }
          break
        case 'path':
          url = url.replace(`{${argument.name}}`, this._arguments[argument.name])
          break
        case 'requestBody':
          jsonData[argument.name] = this._arguments[argument.name]
          break
        default:
      }
    }
    if (querystring.stringify(queryParams) !== '') {
      url = `${url}?${querystring.stringify(queryParams)}`
    }
    return {
      url,
      jsonData,
    }
  }
  /**
   * Sets the given args in to the container
   *
   * @param  {any} args
   */
  public setArgs(args: any) {
    if (!args) {
      return
    }
    this._arguments = args
  }
}
