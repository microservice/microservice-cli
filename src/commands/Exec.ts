import * as fs from 'fs';
import * as rp from 'request-promise';
import * as querystring from 'querystring';
import * as verify from '../verify';
import * as utils from '../utils';
import ora from '../ora';
import Microservice from '../models/Microservice';
import Action from '../models/Action';
const homedir = require('os').homedir();

/**
 * Describes a way to execute a microservice.
 */
export default class Exec {
  _dockerImage: string;
  _microservice: Microservice;
  _arguments: object;
  _environmentVariables: object;
  _dockerServiceId: string;
  _action: Action;
  _portMap: object;

  /**
   * Build an {@link Exec}.
   *
   * @param {String} dockerImage
   * @param {Microservice} microservice
   * @param {Object} _arguments
   * @param {Object} environmentVariables
   */
  constructor(dockerImage, microservice, _arguments, environmentVariables) {
    this._dockerImage = dockerImage;
    this._microservice = microservice;
    this._arguments = _arguments;
    this._environmentVariables = environmentVariables;
    this._dockerServiceId = null;
    this._action = null;
  }

  /**
   * Sets a {@link Action}'s default arguments.
   *
   * @private
   */
  _setDefaultArguments() {
    for (let i = 0; i < this._action.arguments.length; i += 1) {
      const argument = this._action.arguments[i];
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          if (typeof argument.default === 'object') {
            this._arguments[argument.name] = JSON.stringify(argument.default);
          } else {
            this._arguments[argument.name] = argument.default + '';
          }
        }
      }
    }
  }

  /**
   * Sets a {@link Microservice}'s default {@link EnvironmentVariable}s and variables from the system environment variables.
   *
   * @private
   */
  _setDefaultEnvironmentVariables() {
    for (let i = 0; i < this._microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this._microservice.environmentVariables[i];
      if (!this._environmentVariables[environmentVariable.name]) {
        if (environmentVariable.default !== null) {
          this._environmentVariables[environmentVariable.name] = environmentVariable.default;
        }
      }
    }

    for (let i = 0; i < this._microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this._microservice.environmentVariables[i];
      if (process.env[environmentVariable.name]) {
        this._environmentVariables[environmentVariable.name] = process.env[environmentVariable.name];
      }
    }
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   *
   * @private
   */
  _castTypes() {
    const argumentList = Object.keys(this._arguments);
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this._action.getArgument(argumentList[i]);
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name]);
    }
  }

  /**
   * Runs the given {@link Action}.
   *
   * @param {String} action The given action
   */
  async go(action) {
    this._action = this._microservice.getAction(action);
    let spinner = ora.start(`Running action: \`${this._action.name}\``);
    this._setDefaultArguments();
    this._setDefaultEnvironmentVariables();
    if (!this._action.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed action: \`${action}\`. Need to supply required arguments: \`${this._action.requiredArguments.toString()}\``,
      };
    }
    if (!this._microservice.areRequiredEnvironmentVariablesSupplied(this._environmentVariables)) {
      throw {
        spinner,
        message: `Failed action: \`${action}\`. Need to supply required environment variables: \`${this._microservice.requiredEnvironmentVariables.toString()}\``,
      };
    }
    try {
      verify.verifyArgumentTypes(this._action, this._arguments);
      this._castTypes();
      verify.verifyArgumentConstrains(this._action, this._arguments);

      verify.verifyEnvironmentVariableTypes(this._microservice, this._environmentVariables);
      verify.verifyEnvironmentVariablePattern(this._microservice, this._environmentVariables);

      if (this._action.format !== null) {
        const containerID = await this._startDockerExecContainer();
        const output = await this._runDockerExecCommand(containerID);
        verify.verifyOutputType(this._action, output);
        await utils.exec(`docker kill ${containerID}`); // might need to work the lifecycle in
        spinner.succeed(`Ran action: \`${this._action.name}\` with output: ${output.trim()}`);
      } else if (this._action.http !== null) {
        await this._startServer();
        spinner = ora.start(`Running action: \`${this._action.name}\``);
        const output = await this._httpCommand(this._portMap[this._action.http.port]);
        verify.verifyOutputType(this._action, output.trim());
        spinner.succeed(`Ran action: \`${this._action.name}\` with output: ${output.trim()}`);
        await this.serverKill();
      } else if (this._action.events !== null) {
        await this._startServer();
        this._omgJsonFileHandler();
      }
    } catch (e) {
      throw { // TODO kill server here too
        spinner,
        message: `Failed action: \`${action}\`. ${e.toString().trim()}`,
      };
    }
  }

  /**
   * Handle the `.omg.json` state file.
   *
   * @private
   */
  _omgJsonFileHandler() {
    let data = {};
    if (fs.existsSync(`${homedir}/.omg.json`)) {
      data = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`).toString());
    }

    data[process.cwd()] = {
      container_id: this._dockerServiceId,
      events: {},
      ports: {},
    };
    for (let i = 0; i < this._action.events.length; i += 1) {
      data[process.cwd()].events[this._action.events[i].name] = {
        action: this._action.name,
      };
    }

    const neededPorts = Object.keys(this._portMap);
    for (let i = 0; i < neededPorts.length; i += 1) {
      data[process.cwd()].ports[neededPorts[i]] = this._portMap[neededPorts[i]];
    }
    fs.writeFileSync(`${homedir}/.omg.json`, JSON.stringify(data), 'utf8');
  }

  /**
   * Starts the docker container based of this {@link Exec}'s {@link Microservice}'s {@link Lifecycle}. If null,
   * the container will be started with the command: `tail -f /dev/null``.
   *
   * @return {Promise<String>} The id of the started container
   * @private
   */
  async _startDockerExecContainer() {
    const lifecycle = this._microservice.lifecycle;
    if ((lifecycle !== null) && (lifecycle.startup !== null)) {
      return await utils.exec(`docker run -td ${this._dockerImage} ${lifecycle.startup.command} ${lifecycle.startup.args}`);
    } else {
      return await utils.exec(`docker run -td ${this._dockerImage} tail -f /dev/null`);
    }
  }

  /**
   * Runs a given command via Docker cli.
   *
   * @param {String} containerID The given id of the docker container
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   * @private
   */
  async _runDockerExecCommand(containerID) {
    return await utils.exec(`docker exec ${containerID} ${this._action.format.command}${this._formatExec()}`);
  }

  /**
   * Formats an object of environment variables to a `-e KEY='val'` style.
   *
   * @return {String} The formatted string
   * @private
   */
  _formatEnvironmentVariables() {
    let result = '';
    const keys = Object.keys(this._environmentVariables);
    for (let i = 0; i < keys.length; i += 1) {
      result += ` -e ${keys[i]}="${this._environmentVariables[keys[i]]}"`;
    }
    return result;
  }

  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml and builds port mapping.
   *
   * @private
   */
  async _startServer() {
    this._portMap = {};
    const spinner = ora.start('Starting Docker container');
    const neededPorts = utils.getNeededPorts(this._microservice);
    const openPorts = [];
    while (neededPorts.length !== openPorts.length) {
      const possiblePort = await utils.getOpenPort();
      if (!openPorts.includes(possiblePort)) {
        openPorts.push(possiblePort);
      }
    }

    let portString = '';

    for (let i = 0; i < neededPorts.length; i += 1) {
      this._portMap[neededPorts[i]] = openPorts[i];
      portString += `-p ${openPorts[i]}:${neededPorts[i]} `;
    }
    portString = portString.trim();

    this._dockerServiceId = await utils.exec(`docker run -d ${portString}${this._formatEnvironmentVariables()} --entrypoint ${this._microservice.lifecycle.startup.command} ${this._dockerImage} ${this._microservice.lifecycle.startup.args}`);
    spinner.succeed(`Stared Docker container with id: ${this._dockerServiceId.substring(0, 12)}`);
  }

  /**
   * Format the mounting of the path types. Also updates the arguments given to point to the new file location.
   *
   * @return {string} The volumes for Docker
   * @private
   */
  _formatVolumesForPathTypes() {
    let volumeString = '';
    const argList = Object.keys(this._arguments);
    for (let i = 0; i < argList.length; i += 1) {
      const argument = this._action.getArgument(argList[i]);
      if (argument.type === 'path') {
        const argumentValue = this._arguments[argument.name];
        const endPath = argumentValue.split('/')[argumentValue.split('/').length - 1];
        volumeString += ` -v ${argumentValue}:/tmp/${endPath}`;
        this._arguments[argument.name] = `/tmp/${endPath}`;
      }
    }
    return volumeString;
  }

  /**
   * Run this {@link Exec}'s {@link Action} that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @return {Promise<Object>} The response of the Http request
   * @private
   */
  async _httpCommand(port) {
    let data;
    const httpData = this._formatHttp(port);
    try {
      switch (this._action.http.method) {
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
        return await this._httpCommand(port);
      } else {
        throw e;
      }
    }
  }

  /**
   * Formats this {@link Microservice}'s {@link Argument}s into stringified JSON.
   *
   * @return {String} The JSON string
   * @private
   */
  _formatExec() {
    if (this._action.arguments.length > 0) {
      return ` '${JSON.stringify(this._arguments)}'`;
    }
    return '';
  }

  /**
   * Formats an Http request based on this {@link Exec}'s {@link Action}.
   *
   * @param {Number} port The given server info
   * @return {{url: String, jsonData: Object}} The url and data
   * @private
   */
  _formatHttp(port) {
    const jsonData = {};
    const queryParams = {};
    let url = `http://localhost:${port}${this._action.http.path}`;
    for (let i = 0; i < this._action.arguments.length; i += 1) {
      const argument = this._action.arguments[i];
      switch (this._action.getArgument(argument.name).in) {
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
  async serverKill() {
    const spinner = ora.start(`Stopping Docker container: ${this._dockerServiceId.substring(0, 12)}`);
    await utils.exec(`docker kill ${this._dockerServiceId.substring(0, 12)}`);
    spinner.succeed(`Stopped Docker container: ${this._dockerServiceId.substring(0, 12)}`);
  }

  /**
   * Checks it a Docker process is running.
   *
   * @return {Boolean} True if a Docker process is running, otherwise false
   */
  isDockerProcessRunning() {
    return this._dockerServiceId !== null;
  }
}
