import Exec from "./Exec";
import Microservice from "../../models/Microservice";
import FormatExec from "./FormatExec";
import HttpExec from "./HttpExec";
import EventExec from "./EventExec";
import Action from "../../models/Action";

/**
 * TODO
 */
export default class ExecFactory {
  private dockerImage: string;
  private microservice: Microservice;
  private _arguments: any;
  private environmentVariables: any;

  /**
   * TODO.
   *
   * @param {string} dockerImage
   * @param {Microservice} microservice
   * @param {Object} _arguments
   * @param {Object} environmentVariables
   */
  constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    this.dockerImage = dockerImage;
    this.microservice = microservice;
    this._arguments = _arguments;
    this.environmentVariables = environmentVariables;
  }

  /**
   * TODO
   *
   * @param {Action} action
   * @return {Exec}
   */
  getExec(action: Action): Exec {
    if (action.format !== null) {
      return new FormatExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.http !== null) {
      return new HttpExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.events !== null) {
      return new EventExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    }
  }
}
