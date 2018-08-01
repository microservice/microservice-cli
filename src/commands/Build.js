const ora = require('../ora');
const exec = require('../utils').exec;

/**
 * Describes a way to build a microservice.
 */
class Build {
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
      await exec(`docker build -t ${this._name}:local .`);
      spinner.succeed(`Built Docker image with name: ${this._name}`);
    } catch (e) {
      throw {
        spinner,
        message: e.toString().trim(),
      };
    }
  }
}

module.exports = Build;
