import * as _ from 'underscore'
import * as rp from 'request-promise'
import * as querystring from 'querystring'
import { Microservice } from 'omg-validate'
import Run from './Run'
import * as verify from '../../verify'
import http from '../ui/wrappers/http'

/**
 * Represents a http execution of an {@link Action}.
 */
export default class HttpRun extends Run {
  /**
   * Builds a {@link HttpRun}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables the given environment  map
   */
  constructor(
    dockerImage: string,
    microservice: Microservice,
    _arguments: any,
    environmentVariables: any
  ) {
    super(dockerImage, microservice, _arguments, environmentVariables)
  }

  /** @inheritdoc */
  public async exec(
    action: string,
    tmpRetryExec: boolean = false
  ): Promise<string> {
    this.action = this.microservice.getAction(action)
    this.preChecks()
    this.verification()
    const output = await this.httpCommand(
      this.portMap[this.action.http.port],
      tmpRetryExec
    )
    if (tmpRetryExec) {
      verify.verifyOutputType(this.action, output.body.trim())
      return output
    } else {
      verify.verifyOutputType(this.action, output.trim())
      if (
        this.action.output &&
        this.action.output.type &&
        (this.action.output.type === 'map' ||
          this.action.output.type === 'object')
      ) {
        return JSON.stringify(JSON.parse(output.trim()), null, 2)
      }
      return output.trim()
    }
  }

  /**
   * Run this {@link HttpRun}'s {@link Action} that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @param {boolean} tmpRetryExec Temporary boolean
   * @return {Promise<String>} The response of the Http request
   */
  private async httpCommand(
    port: number,
    tmpRetryExec: boolean = false
  ): Promise<any> {
    // Temporary, remove when health is mandatory (put <string> back too)
    let data
    let httpData = this.formatHttp(port)
    let opts = {
      method: `${this.action.http.method.toUpperCase()}`,
      resolveWithFullResponse: tmpRetryExec,
      uri: `${httpData.uri}`,
      body: {},
      headers: {}
    }
    if (this.action.http.method === 'post' || 'put') {
      opts.body = JSON.stringify(httpData.jsonData)
      opts.headers = {
        'Content-Type': 'application/json'
      }
    }
    data = await rp(opts)
    // switch (this.action.http.method) {
    //   case 'get':
    //     data = await rp.get(
    //       tmpRetryExec
    //         ? { url: httpData.url, resolveWithFullResponse: true }
    //         : httpData.url
    //     )
    //     break
    //   case 'post':
    //     data = await rp.post(
    //       tmpRetryExec
    //         ? { url: httpData.url, resolveWithFullResponse: true }
    //         : httpData.url,
    //       {
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(httpData.jsonData)
    //       }
    //     )
    //     break
    //   case 'put':
    //     data = await rp.put(
    //       tmpRetryExec
    //         ? { url: httpData.url, resolveWithFullResponse: true }
    //         : httpData.url,
    //       {
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(httpData.jsonData)
    //       }
    //     )
    //     break
    //   case 'delete':
    //     data = await rp.delete(
    //       tmpRetryExec
    //         ? { url: httpData.url, resolveWithFullResponse: true }
    //         : httpData.url
    //     )
    //     break
    // }
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
    let uri = `http://localhost:${port}${this.action.http.path}`
    for (let i = 0; i < this.action.arguments.length; i += 1) {
      const argument = this.action.arguments[i]
      switch (this.action.getArgument(argument.name).in) {
        case 'query':
          if (!_.isUndefined(this._arguments[argument.name])) {
            queryParams[argument.name] = this._arguments[argument.name]
          }
          break
        case 'path':
          uri = uri.replace(
            `{${argument.name}}`,
            this._arguments[argument.name]
          )
          break
        case 'requestBody':
          jsonData[argument.name] = this._arguments[argument.name]
          break
      }
    }
    if (querystring.stringify(queryParams) !== '') {
      uri = `${uri}?${querystring.stringify(queryParams)}`
    }
    return {
      uri,
      jsonData
    }
  }
  /**
   * @param  {any} args
   */
  public setArgs(args: any) {}
}
