// TODO some of these methods might not be use (then can then be removed along with the class)

const Command = require('./Command');
const Entrypoint = require('./Entrypoint');
const EnvironmentVariable = require('./EnvironmentVariable');
const Volume = require('./Volumes');
const Metrics = require('./Metrics');
const System = require('./System');
const Scale = require('./Scale');
const Lifecycle = require('./Lifecycle');
const Cap = require('./Cap');
const validator = require('../commands/validate');

// TODO what if the Commands or entrypint arent defined. need to handle that
class Microservice {
  constructor(pathToMicroserviceYaml) {
    const valid = JSON.parse(validator(pathToMicroserviceYaml));
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
    this._entrypoint = ((microserviceYamlJson.entrypoint) ? new Entrypoint(microserviceYamlJson.entrypoint) : null);
    this._environmentMap = null;
    if (microserviceYamlJson.environment) {
      this._environmentMap = {};
      const environmentList = Object.keys(microserviceYamlJson.environment);
      for (let i = 0; i < environmentList.length; i += 1) {
        this._environmentMap[environmentList[i]] = new EnvironmentVariable(environmentList[i], microserviceYamlJson.environment[environmentList[i]]);
      }
    }







    this._volumes = []; // TODO
    this._metrics = ((microserviceYamlJson.metrics) ? new Metrics(microserviceYamlJson.metrics) : null);
    this._system = ((microserviceYamlJson.system) ? new System(microserviceYamlJson.system) : null);
    this._scale = ((microserviceYamlJson.scale) ? new Scale(microserviceYamlJson.scale) : null);
    this._lifecycle = ((microserviceYamlJson.lifecycle) ? new Lifecycle(microserviceYamlJson.lifecycle) : null);
    this._cap = ((microserviceYamlJson.cap) ? new Cap(microserviceYamlJson.cap) : null);
  }

  getCommand(command) {
    return this._commandMap[command];
  }

  getEntrypoint() {
    return this._entrypoint;
  }

  getEnvrionment() {
    return this._environmentMap;
  }

  getVolume() {
    return this._volumes;
  }

  getMetrics() {
    return this._metrics;
  }

  getSystem() {
    return this._system;
  }

  getScale() {
    return this._scale;
  }

  getLifecyle() {
    return this._lifecycle;
  }

  getCap() {
    return this._cap;
  }
}

module.exports = Microservice;