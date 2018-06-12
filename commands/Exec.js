const $ = require('shelljs');
const ora = require('ora');
const axios = require('axios');
const { exec, stringifyContainerOutput } = require('./utils');

class Exec {
  constructor(dockerImage, microservice, _arguments, environmentVariables) {
    this._dockerImage = dockerImage;
    this._microservice = microservice;
    this._arguments = _arguments;
    this._environmentVariables = environmentVariables;
  }

  /**
   * Runs the given command.
   *
   * @param command {String} The given command
   */
  async go(command) {
    const spinner = ora(`Running command: ${this._microservice.getCommand(command).name}`).start();
    if (!this._microservice.getCommand(command).areRequiredArguemntsSuplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed command: ${command}. Need to supply required arguments`, // TODO need to say what args
      }
    }
    if (!this._microservice.areRequiredEnvironmentVariablesSupplied(this._environmentVariables)) {
      throw {
        spinner,
        message: `Failed command: ${command}. Need to supply required environment variables`, // TODO need to say what variables
      };
    }
    try {
      if (this._microservice.getCommand(command).http === null) {
        const output = await this._runDockerExecCommand(command);
        spinner.succeed(`Ran command: ${this._microservice.getCommand(command).name} with output: ${output.trim()}`);
      } else {
        // TODO check that lifecycle if provided too (maybe do this in the validation)
        const server = this._startServer();
        const output = await this._httpCommand(server, command);
        spinner.succeed(`Ran command: ${this._microservice.getCommand(command).name} with output: ${stringifyContainerOutput(output)}`);
        await this._serverKill(server.dockerServiceId);
      }
    } catch (e) {
      throw {
        spinner,
        message: `Failed command: ${command}. ${e.toString().trim()}`,
      }
    }
  }

  /**
   * Runs a given command via Docker cli.
   *
   * @param command {String} The given command
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   * @private
   */
  async _runDockerExecCommand(command) {
    const argumentList = Object.keys(this._arguments);
    let dockerRunCommand = '';
    if (this._microservice.getCommand(command).format === '$args') {
      for (let i = 0; i < argumentList.length; i += 1) {
        dockerRunCommand += `--${argumentList[i]} ${arguments[argumentList[i]]} `;
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
   */
  _formatEnvironmentVariables() {
    let result = '';
    const keys = Object.keys(this._environmentVariables);
    for (let i = 0; i < keys.length; i += 1) {
      result += `-e ${keys[i]}="${this._environmentVariables[keys[i]]}" `;
    }
    return result.trim();
  }

  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml.
   *
   * @return {{dockerServiceId: String, port: Number}} An object of the Docker service that was started and the port it was started on
   */
  _startServer() {
    const spinner = ora('Starting Docker container').start();
    const environmentVars = this._formatEnvironmentVariables();

    let openPort;
    let dockerStart;
    let dockerServiceId;
    do {
      openPort = Math.floor(Math.random() * 15000) + 2000; // port range 2000 to 17000
      dockerStart = `docker run -d -p ${openPort}:${this._microservice.lifecycle.startupPort} ${environmentVars} --entrypoint ${this._microservice.lifecycle.startupCommand.command} ${this._dockerImage} ${this._microservice.lifecycle.startupCommand.args}`;
      dockerServiceId = $.exec(dockerStart, { silent: true });
    } while (dockerServiceId.stderr !== '');
    spinner.succeed(`Stared Docker container with id: ${dockerServiceId.substring(0, 12)}`);
    return {
      dockerServiceId: dockerServiceId.stdout.trim(),
      port: openPort,
    }
  }

  /**
   * Run the given command that interfaces via HTTP.
   *
   * @param server {Object} The given sever started in Docker
   * @param command {String} The given command to be ran
   */
  async _httpCommand(server, command) { // TODO format http request (query params, body, or path params)
    let data;
    const url = `http://localhost:${server.port}${this._microservice.getCommand(command).http.endpoint}`;
    try {
      switch (this._microservice.getCommand(command).http.method) {
        case 'get':
          data = await axios.get(url);
          break;
        case 'post':
          data = await axios.post(url, this._arguments);
          break;
        case 'put':
          data = await axios.put(url, this._arguments);
          break;
        case 'delete':
          data = await axios.delete(url);
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
   * Stops a running Docker service
   *
   * @param dockerServiceId {String} The given Docker service id
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
