import Run from './Run';
import Microservice from '../../models/Microservice';
import FormatExec from './FormatExec';
import HttpExec from './HttpExec';
import EventExec from './EventExec';
import Action from '../../models/Action';

/**
 * Represents a factory to build an {@link Exec}.
 */
export default class ExecFactory {
  private readonly dockerImage: string;
  private readonly microservice: Microservice;
  private readonly _arguments: any;
  private readonly environmentVariables: any;

  /**
   * Build an {@link ExecFactory}.
   *
   * @param {String} dockerImage The given docker image
   * @param {Microservice} microservice The given {@link Microservice}
   * @param {Object} _arguments The given argument map
   * @param {Object} environmentVariables the given environment  map
   */
  constructor(dockerImage: string, microservice: Microservice, _arguments: any, environmentVariables: any) {
    this.dockerImage = dockerImage;
    this.microservice = microservice;
    this._arguments = _arguments;
    this.environmentVariables = environmentVariables;
  }

  /**
   * Builds a {@link FormatExec}, {@link HttpExec}, or {@link EventExec} based on the given {@link Action}.
   *
   * @param {Action} action The given {@link Action}
   * @return {Exec} The {@link FormatExec}, {@link HttpExec}, or {@link EventExec}
   */
  getExec(action: Action): Run {
    if (action.format !== null) {
      return new FormatExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.http !== null) {
      return new HttpExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.events !== null) {
      return new EventExec(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    }
  }
}
