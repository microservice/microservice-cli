const http = require('http');
const ora = require('ora');
const axios = require('axios');
const querystring = require('querystring');
const Validate = require('./Validate');
const {exec, stringifyContainerOutput, getOpenPort, typeCast} = require('./utils');

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
    this._dockerServiceId = null;
    this._command = null;
  }

  /**
   * Sets a {@link Command}'s default arguments.
   *
   * @private
   */
  _setDefaultVariables() {
    for (let i = 0; i < this._command.arguments.length; i += 1) {
      const argument = this._command.arguments[i];
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          this._arguments[argument.name] = argument.default;
        }
      }
    }
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   *
   * @private
   */
  _castTypes() {
    for (let i = 0; i < this._command.arguments.length; i += 1) {
      const argument = this._command.arguments[i];
      this._arguments[argument.name] = typeCast[argument.type](this._arguments[argument.name]);
    }
  }

  /**
   * Runs the given {@link Command}.
   *
   * @param {String} command The given command
   */
  async go(command) {
    this._command = this._microservice.getCommand(command);
    const spinner = ora(`Running command: ${this._command.name}`).start();
    this._setDefaultVariables();
    if (!this._command.areRequiredArgumentsSupplied(this._arguments)) {
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
      Validate.verifyArgumentTypes(this._command, this._arguments);
      this._castTypes();
      if (this._command.http === null && this._command.run === null) { // exec command
        const output = await this._runDockerExecCommand();
        Validate.verifyOutputType(this._command, output.trim());
        spinner.succeed(`Ran command: ${this._command.name} with output: ${output.trim()}`);
      } else if (this._command.http !== null && this._command.run === null) { // lifecycle http command
        const output = await this._httpCommand(await this._startServer());
        Validate.verifyOutputType(this._command, stringifyContainerOutput(output));
        spinner.succeed(`Ran command: ${this._command.name} with output: ${stringifyContainerOutput(output)}`);
        await this.serverKill();
      } else { // streaming command
        const server = this._startOMGServer();
        server.listen(7777, '127.0.0.1'); // TODO random open port
        await this._startStream();
        spinner.succeed(`good`);
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
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   * @private
   */
  async _runDockerExecCommand() {
    if (this._command.name === 'entrypoint') {
      return await exec(`docker run ${this._formatEnvironmentVariables()} ${this._dockerImage} ${this._formatExec()}`);
    }
    return await exec(`docker run ${this._formatEnvironmentVariables()} ${this._dockerImage} ${this._command.name} ${this._formatExec()}`);
  }

  // _formatPathArguments(arguments) {
  //
  // }

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

  // TODO startup and shutdown part of the lifecycle
  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml.
   *
   * @private
   * @return {Number} The port the service is running on
   */
  async _startServer() {
    const spinner = ora('Starting Docker container').start();
    const port = await getOpenPort();
    const run = this._microservice.lifecycle.run;
    this._dockerServiceId = await exec(`docker run -d -p ${port}:${run.port} ${this._formatEnvironmentVariables()} --entrypoint ${run.command} ${this._dockerImage} ${run.args}`);
    spinner.succeed(`Stared Docker container with id: ${this._dockerServiceId.substring(0, 12)}`);
    return port;
  }

  // _pathVolumeHelper() { // TODO rename
  //
  // }

  /**
   * Starts a streaming service.
   *
   * @private
   */
  async _startStream() {
    let volumes = '';
    this._dockerServiceId = await exec(`docker run -d ${volumes} ${this._formatEnvironmentVariables()} \
                                       -e OMG_URL='http://host.docker.internal:7777' --net="host" --entrypoint \
                                       ${this._command.run.command} ${this._dockerImage} ${this._command.run.args} \
                                       ${this._formatExec()}`);
  }

  /**
   * Starts a server for a streaming service to POST back to.
   *
   * @return {Server} The server
   * @private
   */
  _startOMGServer() {
    const that = this;
    return http.createServer((req, res) => {
      if (req.method === 'POST') {
        req.on('data', function(data) {
          Validate.verifyOutputType(that._command, stringifyContainerOutput(data.toString()));
          process.stdout.write(`${data.toString()}\n`);
        });
        res.end('Done');
      }
    });
  }

  /**
   * Run the given command that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @return {Promise<Object>} The response of the Http request
   * @private
   */
  async _httpCommand(port) {
    let data;
    const httpData = this._formatHttp(port);
    try {
      switch (this._command.http.method) {
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
      if (e.code === 'ECONNRESET') { // this may cause an issue https://github.com/microservices/microservice-cli/issues/18
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
    if (this._command.arguments.length > 0) {
      return `'${JSON.stringify(this._arguments)}'`;
    }
    return '';
  }

  /**
   * Formats an Http request based on the given {@link Command}.
   *
   * @param {Number} port The given server info
   * @return {{url: String, jsonData: Object}} The url and data
   * @private
   */
  _formatHttp(port) {
    const jsonData = {};
    const queryParams = {};
    let url = `http://localhost:${port}${this._command.http.endpoint}`;
    for (let i = 0; i < this._command.arguments.length; i += 1) {
      const argument = this._command.arguments[i];
      switch (this._command.getArgument(argument.name).location) {
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
   * @private
   */
  async serverKill() { // TODO work the shutdown lifecycle in here
    const spinner = ora(`Stopping Docker container: ${this._dockerServiceId.substring(0, 12)}`).start();
    await exec(`docker kill ${this._dockerServiceId.substring(0, 12)}`);
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

module.exports = Exec;
