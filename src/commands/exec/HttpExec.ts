import * as rp from 'request-promise';
import * as querystring from 'querystring';
import Microservice from '../../models/Microservice';
import Exec from './Exec';
import ora from '../../ora';
import * as utils from '../../utils';
import * as verify from '../../verify';

/**
 * Represents a http execution of an {@link Action}.
 */
export default class HttpExec extends Exec {
  private portMap: any;

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
  public async exec(action) {
    this.action = this.microservice.getAction(action);

    await this.startServer();
    const spinner = ora.start(`Running action: \`${this.action.name}\``);
    this.preChecks(spinner);

    try {
      this.verification();
      const output = await this.httpCommand(this.portMap[this.action.http.port]);
      verify.verifyOutputType(this.action, output.trim());
      spinner.succeed(`Ran action: \`${this.action.name}\` with output: ${output.trim()}`);
      await this.serverKill();
    } catch (e) {
      throw { // still need to kill server here too
        spinner,
        message: `Failed action: \`${action}\`. ${e.toString().trim()}`,
      };
    }
  }

  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml and builds port mapping.
   */
  private async startServer(): Promise<void> {
    this.portMap = {};
    const spinner = ora.start('Starting Docker container');
    const neededPorts = utils.getNeededPorts(this.microservice);
    const openPorts = [];
    while (neededPorts.length !== openPorts.length) {
      const possiblePort = await utils.getOpenPort();
      if (!openPorts.includes(possiblePort)) {
        openPorts.push(possiblePort);
      }
    }

    let portString = '';
    for (let i = 0; i < neededPorts.length; i += 1) {
      this.portMap[neededPorts[i]] = openPorts[i];
      portString += `-p ${openPorts[i]}:${neededPorts[i]} `;
    }
    portString = portString.trim();

    this.dockerServiceId = await utils.exec(`docker run -d ${portString}${this.formatEnvironmentVariables()} --entrypoint ${this.microservice.lifecycle.startup.command} ${this.dockerImage} ${this.microservice.lifecycle.startup.args}`);
    spinner.succeed(`Started Docker container with id: ${this.dockerServiceId.substring(0, 12)}`);
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

  /**
   * Stops a running Docker service.
   */
  async serverKill(): Promise<void> {
    const spinner = ora.start(`Stopping Docker container: ${this.dockerServiceId.substring(0, 12)}`);
    await utils.exec(`docker kill ${this.dockerServiceId.substring(0, 12)}`);
    spinner.succeed(`Stopped Docker container: ${this.dockerServiceId.substring(0, 12)}`);
  }
}
