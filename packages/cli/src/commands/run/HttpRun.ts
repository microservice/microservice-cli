import _ from 'underscore'
import rp from 'request-promise'
import querystring from 'querystring'
import FormData from 'form-data'
import Run from './Run'
import * as verify from '../../verify'

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

  /** @inheritdoc */
  public async exec(action: string, tmpRetryExec: boolean = false): Promise<string> {
    this.action = this.microservice.getAction(action)
    this.preChecks()
    this.verification()
    const output = await this.httpCommand(this.portMap[this.action.http.port], tmpRetryExec)
    if (tmpRetryExec) {
      verify.verifyOutputType(this.action, output.body.trim())
      return output
    }
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
   * Run this {@link HttpRun}'s {@link Action} that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @param {boolean} tmpRetryExec Temporary boolean
   * @return {Promise<String>} The response of the Http request
   */
  private async httpCommand(port: number, tmpRetryExec: boolean = false): Promise<any> {
    // Temporary, remove when health is mandatory (put <string> back too)
    const httpData = this.formatHttp(port)
    const opts: {
      method: string
      resolveWithFullResponse: boolean
      uri: string
      body?: string
      headers?: any
    } = {
      method: this.action.http.method.toUpperCase(),
      resolveWithFullResponse: tmpRetryExec,
      uri: httpData.uri,
    }
    if (this.action.http.method === 'post' || this.action.http.method === 'put') {
      switch (this.action.http.contentType) {
        case 'multipart/form-data': {
          const formData = this.jsonToFormData(httpData.jsonData)
          opts.body = formData.getBuffer()
          opts.headers = {
            ...formData.getHeaders(),
            'content-length': opts.body.length,
          }
          break
        }
        case 'application/x-www-form-urlencoded':
          opts.body = Object.entries(httpData.jsonData)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as any)}`)
            .join('&')
          opts.headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          }
          break
        case 'application/json':
        default: {
          opts.body = JSON.stringify(httpData.jsonData)
          opts.headers = {
            'Content-Type': 'application/json',
          }
        }
      }
    }
    /**
     * Since rp(opts) doesn't pass the tests, I use this
     * in order to add resolveWithFullResponse
     *
     * Since rp.get/post/put/delete cannot use
     * resolveWithFullResponse, I must keep the switchCase for now
     */
    if (tmpRetryExec) {
      return rp(opts)
    }
    let data = {}
    switch (this.action.http.method) {
      case 'get':
        data = await rp.get(opts.uri)
        break
      case 'post':
        data = await rp.post(opts.uri, {
          headers: opts.headers,
          body: opts.body,
        })
        break
      case 'put':
        data = await rp.put(opts.uri, {
          headers: opts.headers,
          body: opts.body,
        })
        break
      case 'delete':
        data = await rp.delete(opts.uri)
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
          uri = uri.replace(`{${argument.name}}`, this._arguments[argument.name])
          break
        case 'requestBody':
          jsonData[argument.name] = this._arguments[argument.name]
          break
        default:
      }
    }
    if (querystring.stringify(queryParams) !== '') {
      uri = `${uri}?${querystring.stringify(queryParams)}`
    }
    return {
      uri,
      jsonData,
    }
  }

  /**
   * Makes a FormData out of a JSON object
   * Not used yet
   *
   * @param  {any} json JSON input
   * @return {FormData} FormData
   */
  // eslint-disable-next-line class-methods-use-this
  private jsonToFormData(json: any): FormData {
    const form: FormData = new FormData()

    Object.entries(json).forEach(([key, value]) => {
      form.append(key, value)
    })
    return form
  }

  /**
   * @param  {any} args
   */
  public setArgs() {
    /* No op */
  }
}
