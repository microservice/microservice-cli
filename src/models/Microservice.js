const Action = require('./Action');
const EnvironmentVariable = require('./EnvironmentVariable');
const Volume = require('./Volume');
const Lifecycle = require('./Lifecycle');
const validateMicroservice = require('../../schema/schema').microservice;

/**
 * Describes a microservice defined by a `microservice.yml`
 */
class Microservice {
  /**
   * Builds a {@link Microservice} defined by a `microservice.yml`.
   *
   * @param {Object} microserviceYamlJson The given raw JSON of the `microservice.yml`
   */
  constructor(microserviceYamlJson) {
    const isValid = validateMicroservice(microserviceYamlJson);
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `root`);
      throw isValid;
    }
    this._rawData = isValid;
    this._actionMap = null;
    if (microserviceYamlJson.actions) {
      this._actionMap = {};
      const actionList = Object.keys(microserviceYamlJson.actions);
      for (let i = 0; i < actionList.length; i += 1) {
        this._actionMap[actionList[i]] = new Action(actionList[i], microserviceYamlJson.actions[actionList[i]]);
      }
    }
    this._environmentMap = null;
    if (microserviceYamlJson.environment) {
      this._environmentMap = {};
      const environmentList = Object.keys(microserviceYamlJson.environment);
      for (let i = 0; i < environmentList.length; i += 1) {
        this._environmentMap[environmentList[i]] = new EnvironmentVariable(environmentList[i], microserviceYamlJson.environment[environmentList[i]]);
      }
    }
    this._volumeMap = null;
    if (microserviceYamlJson.volumes) {
      this._volumeMap = {};
      const volumeList = Object.keys(microserviceYamlJson.volumes);
      for (let i = 0; i < volumeList.length; i += 1) {
        this._volumeMap[volumeList[i]] = new Volume(volumeList[i], microserviceYamlJson.volumes[volumeList[i]]);
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
  get rawData() {
    return this._rawData;
  }

  /**
   * Get a list of {@link Action}s available to this {@link Microservice}.
   *
   * @return {Array<Action>} The {@link Action}s
   */
  get actions() {
    if (this._actionMap === null) {
      return [];
    }
    return Object.values(this._actionMap);
  }

  /**
   * Get's a {@link Action} given the a action name.
   *
   * @param {String} action The given action name
   * @throws {String} If the {@ling Action} does not exists
   * @return {Action} The {@link Action}
   */
  getAction(action) {
    if ((this._actionMap === null) || (!this._actionMap[action])) {
      throw {message: `Action: \`${action}\` does not exist`};
    }
    return this._actionMap[action];
  }

  /**
   * Get a list of {@link EnvironmentVariable}s used by this {@link Microservice}.
   *
   * @return {Array<EnvironmentVariable>} The {@link EnvironmentVariable}s
   */
  get environmentVariables() {
    if (this._environmentMap === null) {
      return [];
    }
    return Object.values(this._environmentMap);
  }

  /**
   * Checks if the required {@link EnvironmentVariable} are supplied.
   *
   * @param {Object} environmentVariableMapping The given mapping of environment variables
   * @return {Boolean} True if all required environment variables are given, otherwise false
   */
  areRequiredEnvironmentVariablesSupplied(environmentVariableMapping) {
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
  get requiredEnvironmentVariables() {
    return this.environmentVariables.filter((e) => e.isRequired()).map((e) => e.name);
  }

  /**
   * Get a list of volumes used by this {@link Microservice}.
   *
   * @return {Array<Volume>} The {@link Volume}s
   */
  get volumes() {
    if (this._volumeMap === null) {
      return [];
    }
    return Object.values(this._volumeMap);
  }

  /**
   * Get's a {@link Volume} based of the given volume name.
   *
   * @param {String} volume The given volume name
   * @throws {String} If the volume does not exists
   * @return {Volume} The {@link Volume}
   */
  getVolume(volume) {
    if ((this._volumeMap === null) || (!this._volumeMap[volume])) {
      throw {message: `Volume: \`${volume}\` does not exist`};
    }
    return this._volumeMap[volume];
  }

  /**
   * Get's this {@link Microservice}'s {@link Lifecycle}.
   *
   * @return {Lifecycle|null} The {@link Lifecycle}
   */
  get lifecycle() {
    return this._lifecycle;
  }
}

module.exports = Microservice;
