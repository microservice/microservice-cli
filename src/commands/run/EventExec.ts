import * as fs from 'fs';
import Run from './Run';
import Microservice from '../../models/Microservice';
const homedir = require('os').homedir();

/**
 * Represents a execution of an {@link Action}'s {@link Event}.
 */
export default class EventExec extends Run {
  /**
   * Builds an {@link EventExec}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables The given environment map
   */
  constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    super(dockerImage, microservice, _arguments, environmentVariables);
  }


  /** @inheritdoc */
  public async exec(action): Promise<string> {
    this.action = this.microservice.getAction(action);
    this.preChecks();
    this.verification();
    this.omgJsonFileHandler();
    return '';
  }

  /**
   * Handle the `.omg.json` state file.
   */
  private omgJsonFileHandler(): void {
    let data = {};
    if (fs.existsSync(`${homedir}/.omg.json`)) {
      data = JSON.parse(fs.readFileSync(`${homedir}/.omg.json`).toString());
    }

    data[process.cwd()] = {
      container_id: this.containerID,
      ports: {},
    };

    const neededPorts = Object.keys(this.portMap);
    for (let i = 0; i < neededPorts.length; i += 1) {
      data[process.cwd()].ports[neededPorts[i]] = this.portMap[neededPorts[i]];
    }
    fs.writeFileSync(`${homedir}/.omg.json`, JSON.stringify(data), 'utf8');
  }

  /** @inheritdoc */
  public isDockerProcessRunning(): boolean {
    return this.containerID !== null;
  }
}
