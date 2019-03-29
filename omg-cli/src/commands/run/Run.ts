import * as utils from '../../utils';
import * as verify from '../../verify';
import Action from '../../models/Action';
import Microservice from '../../models/Microservice';

/**
 * Used to represent a way to execute a {@link Microservice}'s {@link Action}s.
 */
export default abstract class Run {
  protected portMap: any = {}
  protected exposedPorts: any = {}
  protected portBindings: any = {};
  protected dockerImage: string;
  protected microservice: Microservice;
  protected _arguments: any;
  protected environmentVariables: any;
  protected dockerServiceId: string;
  protected action: Action;
  protected containerID: string = null;

  /**
   * Use to help build a {@link FormatRun}, {@link HttpRun}, or an {@link EventRun}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The argument map
   * @param {Object} environmentVariables The environment map
   */
  protected constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    this.dockerImage = dockerImage;
    this.microservice = microservice;
    this._arguments = _arguments;
    this.environmentVariables = environmentVariables;
    this.dockerServiceId = null;
    this.action = null;
  }

  /**
   * Checks if required arguments and environment variables are given and will also set their default values.
   */
  protected preChecks() {
    this.setDefaultArguments();
    if (!this.action.areRequiredArgumentsSupplied(this._arguments)) {
      throw `Need to supply required arguments: \`${this.action.requiredArguments.toString()}\``;
    }
    if (!this.microservice.areRequiredEnvironmentVariablesSupplied(this.environmentVariables)) {
      throw `Need to supply required environment variables: \`${this.microservice.requiredEnvironmentVariables.toString()}\``;
    }
  }

  /**
   * Runs verification on arguments and environment variables.
   */
  protected verification() {
    verify.verifyArgumentTypes(this.action, this._arguments);
    this.castTypes();
    verify.verifyArgumentConstrains(this.action, this._arguments);

    verify.verifyEnvironmentVariableTypes(this.microservice, this.environmentVariables);
    verify.verifyEnvironmentVariablePattern(this.microservice, this.environmentVariables);
  }

  /**
   * Sets a {@link Action}'s default arguments.
   */
  private setDefaultArguments(): void {
    for (let i = 0; i < this.action.arguments.length; i += 1) {
      const argument = this.action.arguments[i];
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
   */
  protected setDefaultEnvironmentVariables(): void {
    for (let i = 0; i < this.microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this.microservice.environmentVariables[i];
      if (!this.environmentVariables[environmentVariable.name]) {
        if (environmentVariable.default !== null) {
          this.environmentVariables[environmentVariable.name] = environmentVariable.default;
        }
      }
    }

    for (let i = 0; i < this.microservice.environmentVariables.length; i += 1) {
      const environmentVariable = this.microservice.environmentVariables[i];
      if (process.env[environmentVariable.name]) {
        this.environmentVariables[environmentVariable.name] = process.env[environmentVariable.name];
      }
    }
  }

  /**
   * Cast the types of the arguments. Everything comes in as a string so it's important to convert to given type.
   */
  protected castTypes(): void {
    const argumentList = Object.keys(this._arguments);
    for (let i = 0; i < argumentList.length; i += 1) {
      const argument = this.action.getArgument(argumentList[i]);
      this._arguments[argument.name] = utils.typeCast[argument.type](this._arguments[argument.name]);
    }
  }

  /**
   * Formats an object of environment variables to a `-e KEY='val'` style.
   *
   * @return {String} The formatted string
   */
  protected formatEnvironmentVariables(): string[] {
    const result = [];
    const keys = Object.keys(this.environmentVariables);
    for (let i = 0; i < keys.length; i += 1) {
      result.push(`${keys[i]}=${this.environmentVariables[keys[i]]}`);
    }
    return result;
  }

  /**
   * Checks it a Docker process is running.
   *
   * @return {Boolean} True if a Docker process is running, otherwise false
   */
  public isDockerProcessRunning(): boolean {
    return false;
  }

  /**
   * Executes the given {@link Action} and returns the output.
   *
   * @param {String} action The given action
   * @return {String} The output
   */
  public abstract async exec(action: string): Promise<string>;

  /**
   * Starts the server for the HTTP command based off the lifecycle provided in the microservice.yml and builds port mapping.
   *
   * @return {String} The id of the container
   */
  public async startService(): Promise<string> {
    this.setDefaultEnvironmentVariables();
    const neededPorts = utils.getNeededPorts(this.microservice);
    const openPorts = [];
    while (neededPorts.length !== openPorts.length) {
      const possiblePort = await utils.getOpenPort();
      if (!openPorts.includes(possiblePort)) {
        openPorts.push(possiblePort);
      }
    }

    for (let i = 0; i < neededPorts.length; i += 1) {
      this.portMap[neededPorts[i]] = openPorts[i];
      this.exposedPorts[`${neededPorts[i]}/tcp`] = {};
      this.portBindings[`${neededPorts[i]}/tcp`] = [{HostPort: openPorts[i].toString()}];
    }

    const container = await utils.docker.createContainer({
      Image: this.dockerImage,
      Cmd: this.microservice.lifecycle.startup,
      Env: this.formatEnvironmentVariables(),
      ExposedPorts: this.exposedPorts,
      HostConfig: {
        PortBindings: this.portBindings,
      },
    });
    await container.start();

    this.containerID = container.$subject.id;
    return this.containerID;
  }

  /**
   * Stops a running Docker service, if it is already stopped just return the id of that container.
   *
   * @return {String} The containerID that has been stopped
   */
  public async stopService(): Promise<string> {
    const container = utils.docker.getContainer(this.containerID);
    await container.kill();
    return this.containerID;
  }

  /**
   * Checks if there is a Docker process running.
   *
   * @return {Boolean} True if running, otherwise false
   */
  public async isRunning(): Promise<boolean> {
    const container = utils.docker.getContainer(this.containerID);
    return (await container.inspect()).State.Running;
  }

  /**
   * Gets the Docker logs.
   *
   * return {String} The Docker logs
   */
  public async getStderr(): Promise<string> {
    const container = utils.docker.getContainer(this.containerID);
    return (await container.logs({stderr: true})).toString().trim();
  }
}
