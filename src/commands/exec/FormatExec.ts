import Exec from './Exec';
import Microservice from '../../models/Microservice';
import ora from '../../ora';
import * as utils from '../../utils';
import * as verify from '../../verify';

/**
 *
 */
export default class FormatExec extends Exec {
  constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    super(dockerImage, microservice, _arguments, environmentVariables);
  }

  /**
   * TODO
   * @param {string} action
   * @return {Promise<void>}
   */
  async exec(action: string) {
    this.action = this.microservice.getAction(action);
    const spinner = ora.start(`Running action: \`${this.action.name}\``);

    this.setDefaultArguments();
    this.setDefaultEnvironmentVariables();

    if (!this.action.areRequiredArgumentsSupplied(this._arguments)) {
      throw {
        spinner,
        message: `Failed action: \`${action}\`. Need to supply required arguments: \`${this.action.requiredArguments.toString()}\``,
      };
    }
    if (!this.microservice.areRequiredEnvironmentVariablesSupplied(this.environmentVariables)) {
      throw {
        spinner,
        message: `Failed action: \`${action}\`. Need to supply required environment variables: \`${this.microservice.requiredEnvironmentVariables.toString()}\``,
      };
    }


    try {
      verify.verifyArgumentTypes(this.action, this._arguments);
      this.castTypes();
      verify.verifyArgumentConstrains(this.action, this._arguments);

      verify.verifyEnvironmentVariableTypes(this.microservice, this.environmentVariables);
      verify.verifyEnvironmentVariablePattern(this.microservice, this.environmentVariables);

      const containerID = await this.startDockerExecContainer();
      const output = await this.runDockerExecCommand(containerID);
      verify.verifyOutputType(this.action, output);
      await utils.exec(`docker kill ${containerID}`);
      spinner.succeed(`Ran action: \`${this.action.name}\` with output: ${output.trim()}`);
    } catch (e) {
      throw {
        spinner,
        message: `Failed action: \`${action}\`. ${e.toString().trim()}`,
      };
    }
  }

  /**
   * Starts the docker container based of this {@link Exec}'s {@link Microservice}'s {@link Lifecycle}. If null,
   * the container will be started with the command: `tail -f /dev/null``.
   *
   * @return {Promise<String>} The id of the started container
   */
  private async startDockerExecContainer(): Promise<string> {
    const lifecycle = this.microservice.lifecycle;
    if ((lifecycle !== null) && (lifecycle.startup !== null)) {
      return await utils.exec(`docker run -td ${this.dockerImage} ${lifecycle.startup.command} ${lifecycle.startup.args}`);
    } else {
      return await utils.exec(`docker run -td ${this.dockerImage} tail -f /dev/null`);
    }
  }

  /**
   * Runs a given command via Docker cli.
   *
   * @param {String} containerID The given id of the docker container
   * @return {Promise<String>} stdout if command runs with exit code 0, otherwise stderror
   */
  private async runDockerExecCommand(containerID: string): Promise<string> {
    return await utils.exec(`docker exec ${containerID} ${this.action.format.command}${this.formatExec()}`);
  }

  /**
   * Formats this {@link Microservice}'s {@link Argument}s into stringified JSON.
   *
   * @return {String} The JSON string
   * @private
   */
  private formatExec(): string {
    if (this.action.arguments.length > 0) {
      return ` '${JSON.stringify(this._arguments)}'`;
    }
    return '';
  }
}
