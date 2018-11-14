import ora from '../ora';
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
   */
  async go(): Promise<string> {
    const spinner = ora.start('Building Docker image');
    try {
      await utils.exec(`docker build -t ${this.name} .`);
      spinner.succeed(`Built Docker image with name: ${this.name}`);
      return this.name;
    } catch (e) {
      throw {
        spinner,
        message: e.toString().trim(),
      };
    }
  }
}
