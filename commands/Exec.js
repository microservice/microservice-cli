const $ = require('shelljs');
const ora = require('ora');
const axios = require('axios');
const querystring = require('querystring');
const Validate = require('./Validate');
const {exec, stringifyContainerOutput} = require('./utils');

/**
 * Describes a way to execute a microservice.
 */
class Exec {
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
  }

  /**
   * Sets a {@link Command}'s default arguments.
   *
   * @param {Command} command The given {@link Command}
   * @private
   */
  _setDefaultVariables(command) {
    for (let i = 0; i < command.arguments.length; i += 1) {
      const argument = command.arguments[i];
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          this._arguments[argument.name] = argument.default;
        }
      }
    }
  }

  /**
   * Runs the given {@link Command}.
   *
   * @param {String} command The given command
   */
  async go(command) {
    const spinner = ora(`Running command: ${this._microservice.getCommand(command).name}`).start();
    this._setDefaultVariables(this._microservice.getCommand(command));
    if (!this._microservice.getCommand(command).areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed command: ${command}. Need to supply required arguments`, // TODO need to say what args
      };
    }
    if (!this._microservice.areRequiredEnvironmentVariablesSupplied(this._environmentVariables)) {
      throw {
        spinner,
        message: `Failed command: ${command}. Need to supply required environment variables`, // TODO need to say what variables
      };
    }
    try {
      Validate.verifyArgumentTypes(this._microservice.getCommand(command), this._arguments);
      if (this._microservice.getCommand(command).http === null) {
        const output = await this._runDockerExecCommand(command);
        Validate.verifyOutputType(this._microservice.getCommand(command), output.trim());
        spinner.succeed(`Ran command: ${this._microservice.getCommand(command).name} with output: ${output.trim()}`);
      } else {
        // TODO check that lifecycle if provided too (maybe do this in the validation)
        const server = this._startServer(command);
        const output = await this._httpCommand(server, command);
        Validate.verifyOutputType(this._microservice.getCommand(command), stringifyContainerOutput(output));
        spinner.succeed(`Ran command: ${this._microservice.getCommand(command).name} with output: ${stringifyContainerOutput(output)}`);
        await this._serverKill(server.dockerServiceId);
      }
    } catch (e) {
      throw {
        spinner,
        message: `Failed command: ${command}. ${e.toString().trim()}`,
      };
    }
  }

  /**
   * Runs a given command via Docker cli.
   *
   * @param {String} command  The given command
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   * @private
   */
  async _runDockerExecCommand(command) {
    const argumentList = Object.keys(this._arguments);
    let dockerRunCommand = '';
    if (this._microservice.getCommand(command).format === '$args') {
      for (let i = 0; i < argumentList.length; i += 1) {
        dockerRunCommand += `--${argumentList[i]} ${this._arguments[argumentList[i]]} `;
      }
    } else if (this._microservice.getCommand(command).format === '$json') {
      dockerRunCommand = JSON.stringify(this._arguments);
    } else {
      dockerRunCommand = `${this._microservice.getCommand(command).format}`;
      for (let i = 0; i < argumentList.length; i += 1) {
        dockerRunCommand = dockerRunCommand.replace(`{{${argumentList[i]}}}`, this._arguments[argumentList[i]]);
      }
    }
    if (command === 'entrypoint') {
      return await exec(`docker run ${this._formatEnvironmentVariables()} ${this._dockerImage} ${dockerRunCommand}`);
    }
    return await exec(`docker run ${this._formatEnvironmentVariables()} ${this._dockerImage} ${command} ${dockerRunCommand}`);
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
      result += `-e ${keys[i]}="${this._environmentVariables[keys[i]]}" `;
    }
    return result.trim();
  }

  // TODO https://github.com/microservices/microservice-cli/issues/15 this needs to be able to support lifecycle servers too
  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml.
   *
   * @param {String} command The given command
   * @private
   * @return {{dockerServiceId: String, port: Number}} An object of the Docker service that was started and the port it was started on
   */
  _startServer(command) {
    const spinner = ora('Starting Docker container').start();
    const environmentVars = this._formatEnvironmentVariables();
    const run = this._microservice.getCommand(command).run;

    let openPort;
    let dockerStart;
    let dockerServiceId;
    do {
      openPort = Math.floor(Math.random() * 15000) + 2000; // port range 2000 to 17000
      dockerStart = `docker run -d -p ${openPort}:${run.port} ${environmentVars} --entrypoint ${run.command} ${this._dockerImage} ${run.args}`;
      dockerServiceId = $.exec(dockerStart, {silent: true});
    } while (dockerServiceId.stderr !== '');
    spinner.succeed(`Stared Docker container with id: ${dockerServiceId.substring(0, 12)}`);
    return {
      dockerServiceId: dockerServiceId.stdout.trim(),
      port: openPort,
    };
  }

  /**
   * Run the given command that interfaces via HTTP.
   *
   * @param {Object} server The given sever started in Docker
   * @param {String} command The given command to be ran
   * @return {Promise<Object>} The response of the Http request
   * @private
   */
  async _httpCommand(server, command) { // TODO format http request (query params, body, or path params)
    let data;
    const httpData = this._formatHttp(server, this._microservice.getCommand(command));
    try {
      switch (this._microservice.getCommand(command).http.method) {
        case 'get':
          data = await axios.get(httpData.url);
          break;
        case 'post':
          data = await axios.post(httpData.url, httpData.jsonData);
          break;
        case 'put':
          data = await axios.put(httpData.url, httpData.jsonData);
          break;
        case 'delete':
          data = await axios.delete(httpData.url);
          break;
      }
      return data.data;
    } catch (e) {
      if (e.code === 'ECONNRESET') {
        return await this._httpCommand(server, command);
      } else {
        throw e;
      }
    }
  }

  /**
   * Formats an Http request based on the given {@link Command}.
   *
   * @param {Object} server The given server info
   * @param  {Command} command The given {@link Command}
   * @return {{url: String, jsonData: Object}}
   * @private
   */
  _formatHttp(server, command) {
    const jsonData = {};
    const queryParams = {};
    let url = `http://localhost:${server.port}${command.http.endpoint}`;
    for (let i = 0; i < command.arguments.length; i += 1) {
      const argument = command.arguments[i];
      switch (command.getArgument(argument.name).location) {
        case 'query':
          queryParams[argument.name] = this._arguments[argument.name];
          break;
        case 'path':
          url = url.replace(`{{${argument.name}}}`, this._arguments[argument.name]);
          break;
        case 'body':
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
   *
   * @param {String} dockerServiceId The given Docker service id
   * @private
   */
  async _serverKill(dockerServiceId) { // TODO work the shutdown lifecycle in here
    dockerServiceId = dockerServiceId.substring(0, 12);
    const spinner = ora(`Stopping Docker container: ${dockerServiceId}`).start();
    const command = `docker stop ${dockerServiceId}`;
    await exec(command);
    spinner.succeed(`Stopped Docker container: ${dockerServiceId}`);
  }
}

module.exports = Exec;
