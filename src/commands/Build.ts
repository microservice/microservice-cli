import ora from '../ora';
import * as utils from '../utils';

/**
 * Describes a way to build a microservice.
 */
export default class Build {
  _name: string;

  /**
   * Build a {@link Build}.
   *
   * @param {String} name The given name
   */
  constructor(name) {
    this._name = name;
  }

  /**
   * Builds a Docker image with this {@link Build}'s name prefaced with `omg/` and tagged with `local`.
   */
  async go() {
    const spinner = ora.start('Building Docker image');
    try {
      await utils.exec(`docker build -t ${this._name} .`);
      spinner.succeed(`Built Docker image with name: ${this._name}`);
    } catch (e) {
      throw {
        spinner,
        message: e.toString().trim(),
      };
    }
  }
}
