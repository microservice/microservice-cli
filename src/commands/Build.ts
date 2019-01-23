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
  async go(): Promise<string> { // TODO
    const stream = await utils.d.buildImage({
      context: process.cwd(),
      src: ['Dockerfile'],
    }, {
      t: this.name,
    });

    await new Promise((resolve, reject) => {
      utils.d.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
    });
    // await utils.exec(`docker build -t ${this.name} .`, false);
    return this.name;
  }
}
