import Exec from './Exec';
import Microservice from '../../models/Microservice';
import * as utils from '../../utils';
import * as verify from '../../verify';

/**
 * Represents a docker exec execution of an {@link Action}.
 */
export default class FormatExec extends Exec {
  /**
   * Builds a {@link FormatExec}.
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
    const output = await this.runDockerExecCommand(this.containerID);
    verify.verifyOutputType(this.action, output);
    if ((this.action.output) && (this.action.output.type) && ((this.action.output.type === 'map') || this.action.output.type === 'object')) {
      return JSON.stringify(JSON.parse(output.trim()), null, 2);
    }
    return output.trim();
  }

  /**
   * Starts the docker container based of this {@link Exec}'s {@link Microservice}'s {@link Lifecycle}. If null,
   * the container will be started with the command: `tail -f /dev/null``.
   *
   * @return {Promise<String>} The id of the started container
   */
  public async startService(): Promise<string> {
    this.setDefaultEnvironmentVariables();
    const lifecycle = this.microservice.lifecycle;
    if ((lifecycle !== null) && (lifecycle.startup !== null)) {
      this.containerID = await utils.exec(`docker run -td${this.formatEnvironmentVariables()} --entrypoint ${lifecycle.startup.command} ${this.dockerImage} ${lifecycle.startup.args}`);
    } else {
      this.containerID = await utils.exec(`docker run -td${this.formatEnvironmentVariables()} --entrypoint tail ${this.dockerImage} -f /dev/null`);
    }
    return this.containerID;
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
