import Action from './Action';
import EnvironmentVariable from './EnvironmentVariable';
import Volume from './Volume';
import Lifecycle from './Lifecycle';
const validateMicroservice = require('../schema/schema').microservice;

/**
 * Describes a microservice defined by a `microservice.yml`
 */
export default class Microservice {
  private readonly _rawData: object;
  private readonly actionMap: object;
  private readonly environmentMap: object;
  private readonly volumeMap: object;
  private readonly _lifecycle: Lifecycle;

  /**
   * Builds a {@link Microservice} defined by a `microservice.yml`.
   *
   * @param {Object} microserviceYamlJson The given raw JSON of the `microservice.yml`
   */
  constructor(microserviceYamlJson: any) {
    const isValid = validateMicroservice(microserviceYamlJson);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `root`);
      throw isValid;
    }
    this._rawData = isValid;
    this.actionMap = null;
    if (microserviceYamlJson.actions) {
      this.actionMap = {};
      const actionList = Object.keys(microserviceYamlJson.actions);
      for (let i = 0; i < actionList.length; i += 1) {
        this.actionMap[actionList[i]] = new Action(actionList[i], microserviceYamlJson.actions[actionList[i]]);
      }
    }
    this.environmentMap = null;
    if (microserviceYamlJson.environment) {
      this.environmentMap = {};
      const environmentList = Object.keys(microserviceYamlJson.environment);
      for (let i = 0; i < environmentList.length; i += 1) {
        this.environmentMap[environmentList[i]] = new EnvironmentVariable(environmentList[i], microserviceYamlJson.environment[environmentList[i]]);
      }
    }
    this.volumeMap = null;
    if (microserviceYamlJson.volumes) {
      this.volumeMap = {};
      const volumeList = Object.keys(microserviceYamlJson.volumes);
      for (let i = 0; i < volumeList.length; i += 1) {
        this.volumeMap[volumeList[i]] = new Volume(volumeList[i], microserviceYamlJson.volumes[volumeList[i]]);
      }
    }
    this._lifecycle = ((microserviceYamlJson.lifecycle) ? new Lifecycle(microserviceYamlJson.lifecycle) : null);
    for (let i = 0; i < this.actions.length; i += 1) {
      if ((this.actions[i].http !== null) && (this.lifecycle === null)) {
        throw {
          context: `Action with name: \`${this.actions[i].name}\``,
          message: 'If an action interfaces with http then a lifecycle must be provided',
        };
      }
    }
  }

  /**
   * Get the raw object used to build this {@link Microservice}.
   *
   * @return {{valid}|Object|*|{valid, yaml, errors}|{valid, issue, errors}}
   */
  public get rawData(): any {
    return this._rawData;
  }

  /**
   * Get a list of {@link Action}s available to this {@link Microservice}.
   *
   * @return {Array<Action>} The {@link Action}s
   */
  public get actions(): Action[] {
    if (this.actionMap === null) {
      return [];
    }
    return (<any>Object).values(this.actionMap);
  }

  /**
   * Get's a {@link Action} given the a action name.
   *
   * @param {String} action The given action name
   * @throws {String} If the {@ling Action} does not exists
   * @return {Action} The {@link Action}
   */
  public getAction(action): Action {
    if ((this.actionMap === null) || (!this.actionMap[action])) {
      throw `Action: \`${action}\` does not exist`;
    }
    return this.actionMap[action];
  }

  /**
   * Get a list of {@link EnvironmentVariable}s used by this {@link Microservice}.
   *
   * @return {Array<EnvironmentVariable>} The {@link EnvironmentVariable}s
   */
  public get environmentVariables(): EnvironmentVariable[] {
    if (this.environmentMap === null) {
      return [];
    }
    return (<any>Object).values(this.environmentMap);
  }

  /**
   * Checks if the required {@link EnvironmentVariable} are supplied.
   *
   * @param {Object} environmentVariableMapping The given mapping of environment variables
   * @return {Boolean} True if all required environment variables are given, otherwise false
   */
  public areRequiredEnvironmentVariablesSupplied(environmentVariableMapping): boolean {
    const requiredEnvironmentVariable = this.requiredEnvironmentVariables;
    for (let i = 0; i< requiredEnvironmentVariable.length; i += 1) {
      if (!Object.keys(environmentVariableMapping).includes(requiredEnvironmentVariable[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get this {@link Microservice}'s required {@link EnvironmentVariable}s.
   *
   * @return {Array<String>} The required {@link EnvironmentVariable}'s names
   */
  public get requiredEnvironmentVariables(): string[] {
    return this.environmentVariables.filter((e) => e.isRequired()).map((e) => e.name);
  }

  /**
   * Get a list of volumes used by this {@link Microservice}.
   *
   * @return {Array<Volume>} The {@link Volume}s
   */
  public get volumes(): Volume[] {
    if (this.volumeMap === null) {
      return [];
    }
    return (<any>Object).values(this.volumeMap);
  }

  /**
   * Get's a {@link Volume} based of the given volume name.
   *
   * @param {String} volume The given volume name
   * @throws {String} If the volume does not exists
   * @return {Volume} The {@link Volume}
   */
  public getVolume(volume): Volume {
    if ((this.volumeMap === null) || (!this.volumeMap[volume])) {
      throw {message: `Volume: \`${volume}\` does not exist`};
    }
    return this.volumeMap[volume];
  }

  /**
   * Get's this {@link Microservice}'s {@link Lifecycle}.
   *
   * @return {Lifecycle} The {@link Lifecycle}
   */
  public get lifecycle(): Lifecycle {
    return this._lifecycle;
  }
}
