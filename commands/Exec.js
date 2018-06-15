const $ = require('shelljs');
const http = require('http');
const ora = require('ora');
const axios = require('axios');
const querystring = require('querystring');
const Validate = require('./Validate');
const { exec, stringifyContainerOutput, getOpenPort} = require('./utils');

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
  }

  /**
   * Sets a {@link Command}'s default arguments.
   *
   * @param {Command} command The given {@link Command}
   * @private
   */
  _setDefaultVariables(command) {
    this._arguments['yaml'] = '/test.yml';
    for (let i = 0; i < command.arguments.length; i += 1) {
      const argument = command.arguments[i];
      if (!this._arguments[argument.name]) {
        if (argument.default !== null) {
          this._arguments[argument.name] = argument.default;
        } else {
          this._arguments[argument.name] = '';
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
      const microserviceCommand = this._microservice.getCommand(command);
      Validate.verifyArgumentTypes(microserviceCommand, this._arguments);
      if (microserviceCommand.http === null && microserviceCommand.run === null) { // exec command
        const output = await this._runDockerExecCommand(command);
        Validate.verifyOutputType(microserviceCommand, output.trim());
        spinner.succeed(`Ran command: ${microserviceCommand.name} with output: ${output.trim()}`);
      } else if (microserviceCommand.http !== null && microserviceCommand.run === null) { // lifecycle http command
        const port = await this._startServer(command);
        const output = await this._httpCommand(port, command);
        Validate.verifyOutputType(microserviceCommand, stringifyContainerOutput(output));
        spinner.succeed(`Ran command: ${microserviceCommand.name} with output: ${stringifyContainerOutput(output)}`);
        await this.serverKill();
      } else { // streaming command
        // const server = this._startStream(command);
        const server = this._startOMGServer();
        server.listen(7777, '127.0.0.1');
        // this._startStream(command);
        await this._startStream(command);
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
    return await exec(`docker run -v ~/test.yml:/test.yml ${this._formatEnvironmentVariables()} ${this._dockerImage} ${command} ${dockerRunCommand}`); // TODO
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
   * @param {String} command The given command
   * @private
   * @return {Number} The port the service is running on
   */
  async _startServer(command) {
    const spinner = ora('Starting Docker container').start();
    const port = await getOpenPort();
    const run = this._microservice.lifecycle.run;
    const dockerServiceId = await exec(`docker run -d -p ${port}:${run.port} ${this._formatEnvironmentVariables()} --entrypoint ${run.command} ${this._dockerImage} ${run.args}`);
    spinner.succeed(`Stared Docker container with id: ${dockerServiceId.substring(0, 12)}`);
    this._dockerServiceId = dockerServiceId;
    return port;
  }

  _pathVolumeHelper() { // TODO rename

  }

  async _startStream(command) {
    let volumes = '';
    const argumentList = Object.keys(this._arguments);
    let dockerRunCommand = '';
    // do file stuff here
    if (this._microservice.getCommand(command).format === '$args') {
      for (let i = 0; i < argumentList.length; i += 1) {
        dockerRunCommand += `--${argumentList[i]} ${this._arguments[argumentList[i]]} `; // CAN FACTOR OUT FORMATTING
      }
    } else if (this._microservice.getCommand(command).format === '$json') {
      dockerRunCommand = JSON.stringify(this._arguments);
    } else {
      dockerRunCommand = `${this._microservice.getCommand(command).format}`;
      for (let i = 0; i < argumentList.length; i += 1) {
        dockerRunCommand = dockerRunCommand.replace(`{{${argumentList[i]}}}`, this._arguments[argumentList[i]]);
      }
    }
    const run = this._microservice.getCommand(command).run;
    const environmentVars = this._formatEnvironmentVariables();
    const dockerStart = `docker run -d ${volumes} ${environmentVars} -e OMG_URL='http://host.docker.internal:7777' --net="host" --entrypoint ${run.command} ${this._dockerImage} ${run.args} ${dockerRunCommand}`;
    this._dockerServiceId = await exec(dockerStart);
  }

  _startOMGServer() {
    return http.createServer((req, res) => {
      if (req.method === 'POST') {
        req.on('data', function (data) {
          console.log(data.toString());
        });
        res.end('post received');
      }
    });
  }

  /**
   * Run the given command that interfaces via HTTP.
   *
   * @param {Number} port The given sever started in Docker
   * @param {String} command The given command to be ran
   * @return {Promise<Object>} The response of the Http request
   * @private
   */
  async _httpCommand(port, command) {
    let data;
    const httpData = this._formatHttp(port, this._microservice.getCommand(command));
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
      if (e.code === 'ECONNRESET') { // this may cause an issue https://github.com/microservices/microservice-cli/issues/18
        return await this._httpCommand(port, command);
      } else {
        throw e;
      }
    }
  }

  // __formatExec(command) {
  //
  // }

  /**
   * Formats an Http request based on the given {@link Command}.
   *
   * @param {Number} port The given server info
   * @param  {Command} command The given {@link Command}
   * @return {{url: String, jsonData: Object}} The url and data
   * @private
   */
  _formatHttp(port, command) {
    const jsonData = {};
    const queryParams = {};
    let url = `http://localhost:${port}${command.http.endpoint}`;
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
   * @private
   */
  async serverKill() { // TODO work the shutdown lifecycle in here
    const dockerServiceId = this._dockerServiceId.substring(0, 12);
    const spinner = ora(`Stopping Docker container: ${dockerServiceId}`).start();
    const command = `docker kill ${dockerServiceId}`;
    await exec(command);
    spinner.succeed(`Stopped Docker container: ${dockerServiceId}`);
  }

  isDockerProcessRunning() {
    return this._dockerServiceId !== null;
  }
}

module.exports = Exec;
