const http = require('http');
const rp = require('request-promise');
const ora = require('ora');
const querystring = require('querystring');
const Validate = require('./Validate');
const {exec, getOpenPort, typeCast} = require('./utils');

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
  _setDefaultArguments() {
    for (let i = 0; i < this._command.arguments.length; i += 1) {
      const argument = this._command.arguments[i];
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          this._arguments[argument.name] = argument.default;
        }
      }
    }
  }

  _setDefaultEnvironmentVariables() {
    for (let i = 0; i < this._microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this._microservice.environmentVariables[i];
      if (!this._environmentVariables[environmentVariable.name]) {
        if (environmentVariable.default !== null) {
          this._environmentVariables[environmentVariable.name] = environmentVariable.default;
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
    const argumentList = Object.keys(this._arguments);
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this._command.getArgument(argumentList[i]);
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
    const spinner = ora(`Running command: \`${this._command.name}\``).start();
    this._setDefaultArguments();
    this._setDefaultEnvironmentVariables();
    if (!this._command.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed command: \`${command}\`. Need to supply required arguments: \`${this._command.requiredArguments.toString()}\``,
      };
    }
    if (!this._microservice.areRequiredEnvironmentVariablesSupplied(this._environmentVariables)) {
      throw {
        spinner,
        message: `Failed command: \`${command}\`. Need to supply required environment variables: \`${this._microservice.requiredEnvironmentVariables.toString()}\``,
      };
    }
    try {
      Validate.verifyArgumentTypes(this._command, this._arguments);
      this._castTypes();
      Validate.verifyArgumentConstrains(this._command, this._arguments);

      Validate.verifyEnvironmentVariableTypes(this._microservice, this._environmentVariables);
      Validate.verifyEnvironmentVariablePattern(this._microservice, this._environmentVariables);

      if (this._command.http === null && this._command.run === null) { // exec command
        const output = await this._runDockerExecCommand();
        Validate.verifyOutputType(this._command, output);
        spinner.succeed(`Ran command: \`${this._command.name}\` with output: ${output.trim()}`);
      } else if (this._command.http !== null && this._command.run === null) { // lifecycle http command
        const output = await this._httpCommand(await this._startServer());
        Validate.verifyOutputType(this._command, output.trim());
        spinner.succeed(`Ran command: \`${this._command.name}\` with output: ${output.trim()}`);
        await this.serverKill();
      } else { // streaming command
        const server = this._startOMGServer();
        const port = await getOpenPort();
        server.listen(port, '127.0.0.1');
        await this._startStream(port);
        spinner.succeed(`Ran command: \`${this._command.name}\` output will be streamed in (To exit, press ^C)`);
      }
    } catch (e) {
      throw { // TODO kill server here too
        spinner,
        message: `Failed command: \`${command}\`. ${e.toString().trim()}`,
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
      return await exec(`docker run ${this._formatVolumesForPathTypes()} ${this._formatEnvironmentVariables()} ${this._dockerImage} ${this._formatExec()}`);
    }
    return await exec(`docker run ${this._formatVolumesForPathTypes()} ${this._formatEnvironmentVariables()} ${this._dockerImage} ${this._command.name} ${this._formatExec()}`);
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
      const argument = this._command.getArgument(argList[i]);
      if (argument.type === 'path') {
        const argumentValue = this._arguments[argument.name];
        const endPath = argumentValue.split('/')[argumentValue.split('/').length - 1];
        volumeString += `-v ${argumentValue}:/tmp/${endPath} `;
        this._arguments[argument.name] = `/tmp/${endPath}`;
      }
    }
    return volumeString;
  }

  /**
   * Starts a streaming service.
   *
   * @param {Number} port The port the OMG server is running on
   * @private
   */
  async _startStream(port) {
    this._dockerServiceId = await exec(`docker run -d ${this._formatVolumesForPathTypes()} ${this._formatEnvironmentVariables()} \
                                       -e OMG_URL='http://host.docker.internal:${port}' --net="host" --entrypoint \
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
        req.on('data', (data) => {
          Validate.verifyOutputType(that._command, data);
          process.stdout.write(`${data}\n`);
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
