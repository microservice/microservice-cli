import Run from './Run';
import Microservice from '../../models/Microservice';
import FormatRun from './FormatRun';
import HttpRun from './HttpRun';
import EventRun from './EventRun';
import Action from '../../models/Action';
import UIRun from './UIRun';

/**
 * Represents a factory to build an {@link Run}.
 */
export default class RunFactory {
  private readonly dockerImage: string;
  private readonly microservice: Microservice;
  private readonly _arguments: any;
  private readonly environmentVariables: any;

  /**
   * Build an {@link RunFactory}.
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
   * Builds a {@link FormatRun}, {@link HttpRun}, or {@link EventRun} based on the given {@link Action}.
   *
   * @param {Action} action The given {@link Action}
   * @return {Run} The {@link FormatRun}, {@link HttpRun}, or {@link EventRun}
   */
  getRun(action: Action, ui: boolean = false): Run {
    if (ui === true) {
      return new UIRun(
        this.dockerImage,
        this.microservice,
        this.environmentVariables
      )
    } else if (action.format !== null) {
      return new FormatRun(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.http !== null) {
      return new HttpRun(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    } else if (action.events !== null) {
      return new EventRun(this.dockerImage, this.microservice, this._arguments, this.environmentVariables);
    }
  }
}
