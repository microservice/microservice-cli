import * as utils from '../utils';

/**
 * Describes a way to build a microservice.
 */
export default class Build {
  private readonly name: string;

  /**
   * Build a {@link Build}.
   *
   * @param {String} name The given name
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Builds a Docker image with this {@link Build}'s name prefaced with `omg/` and tagged with `local`.
   *
   * @param {Boolean} [silent=false] The given boolean if output should be logged or not
   * @return {String} The name of the docker container that was build
   */
  async go(silent=false, ui: boolean = false): Promise<any> {
    if (ui) {
      return {
        name: this.name,
        log: await utils.exec(`docker build -t ${this.name} .`, false),
      };
    } else {
      await utils.exec(`docker build -t ${this.name} .`, silent); // This needs to be changed to use dockerode
      return this.name;
    }
  }
}
