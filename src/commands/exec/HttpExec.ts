import * as rp from 'request-promise';
import * as querystring from 'querystring';
import Microservice from '../../models/Microservice';
import Exec from './Exec';
import * as verify from '../../verify';

/**
 * Represents a http execution of an {@link Action}.
 */
export default class HttpExec extends Exec {
  /**
   * Builds a {@link HttpExec}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables the given environment  map
   */
  constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    super(dockerImage, microservice, _arguments, environmentVariables);
  }

  /** @inheritdoc */
  public async exec(action: string): Promise<string> {
    this.action = this.microservice.getAction(action);
    this.preChecks();
    this.verification();
    const output = await this.httpCommand(this.portMap[this.action.http.port]);
    verify.verifyOutputType(this.action, output.trim());
    return output;
  }

  /**
   * Run this {@link Exec}'s {@link Action} that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @return {Promise<String>} The response of the Http request
   */
  private async httpCommand(port: number): Promise<string> {
    let data;
    const httpData = this.formatHttp(port);
    try {
      switch (this.action.http.method) {
        case 'get':
          data = await rp.get(httpData.url);
          break;
        case 'post':
          data = await rp.post(httpData.url, {
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(httpData.jsonData),
          });
          break;
        case 'put':
          data = await rp.put(httpData.url, {
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(httpData.jsonData),
          });
          break;
        case 'delete':
          data = await rp.delete(httpData.url);
          break;
      }
      return data;
    } catch (e) {
      if (e.message === 'Error: socket hang up') { // this may cause an issue https://github.com/microservices/microservice-cli/issues/18
        return await this.httpCommand(port);
      } else {
        throw e;
      }
    }
  }

  /**
   * Formats an Http request based on this {@link Exec}'s {@link Action}.
   *
   * @param {Number} port The given server info
   * @return {{url: String, jsonData: Object}} The url and data
   */
  private formatHttp(port: number): any {
    const jsonData = {};
    const queryParams = {};
    let url = `http://localhost:${port}${this.action.http.path}`;
    for (let i = 0; i < this.action.arguments.length; i += 1) {
      const argument = this.action.arguments[i];
      switch (this.action.getArgument(argument.name).in) {
        case 'query':
          queryParams[argument.name] = this._arguments[argument.name];
          break;
        case 'path':
          url = url.replace(`{{${argument.name}}}`, this._arguments[argument.name]);
          break;
        case 'requestBody':
          jsonData[argument.name] = this._arguments[argument.name];
          break;
      }
    }
    if (querystring.stringify(queryParams) !== '') {
      url = `${url}?${querystring.stringify(queryParams)}`;
    }
    return {
      url,
      jsonData,
    };
  }
}
