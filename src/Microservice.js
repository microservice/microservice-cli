// TODO some of these methods might not be use (then can then be removed along with the class)

const Command = require('./Command');
const EnvironmentVariable = require('./EnvironmentVariable');
const Volume = require('./Volume');
const Lifecycle = require('./Lifecycle');
const validator = require('../schema/schema');

class Microservice {
  constructor() {
    const valid = JSON.parse(validator());
    if (!valid.valid) {
      // TODO message
      process.exit(1);
    }
    const microserviceYamlJson = valid.microsericeYaml;
    this._environmentMap = null;
    if (microserviceYamlJson.commands) {
      this._commandMap = {};
      const commandList = Object.keys(microserviceYamlJson.commands);
      for (let i = 0; i < commandList.length; i += 1) {
        this._commandMap[commandList[i]] = new Command(commandList[i], microserviceYamlJson.commands[commandList[i]]);
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
  }

  /**
   *
   * @return {Array}
   */
  get commands() {
    if (this._commandMap === null) {
      return [];
    }
    return Object.values(this._commandMap);
  }

  getCommand(command) {
    if ((this._commandMap === null) || (!this._commandMap[command])) {
      throw 'Command does not exist';
    }
    return this._commandMap[command];
  }

  get environmentVariables() {
    if (this._environmentMap === null) {
      return [];
    }
    return Object.values(this._environmentMap);
  }

  areRequiredEnvironmentVariablesSupplied(environmentVariables) {
    const requiredEnvironmentVariable = this.environmentVariables.filter(e => e.isRequired()).map(e => e.name);
    for (let i = 0; i< requiredEnvironmentVariable.length; i += 1) {
      if (!Object.keys(environmentVariables).includes(requiredEnvironmentVariable[i])) {
        return false;
      }
    }
    return true;
  }

  get volumes() {
    if (this._volumeMap === null) {
      return [];
    }
    return Object.keys(this._volumeMap);
  }

  getVolume(volume) {
    if ((this._volumeMap === null) || (!this._volumeMap[volume])) {
      throw 'Volume does not exist';
    }
    return this._volumeMap[volume];
  }

  get lifecycle() {
    return this._lifecycle;
  }

}

module.exports = Microservice;
