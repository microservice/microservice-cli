import * as utils from '../utils'
const Dockerode = require('dockerode')

/**
 * Describes a way to build a microservice.
 */
export default class Build {
  private readonly name: string

  /**
   * Build a {@link Build}.
   *
   * @param {String} name The given name
   */
  constructor(name: string) {
    this.name = name
  }

  /**
   * Builds a Docker image with this {@link Build}'s name prefaced with `omg/` and tagged with `local`.
   *
   * @param {Boolean} [silent=false] The given boolean if output should be logged or not
   * @param  {boolean} [ui=false] The given boolean if ui mode is enabled or not
   * @return {String} The name of the docker container that was build
   */
  async go(silent = false, ui = false): Promise<any> {
    if (ui) {
      const stream = await utils.docker.buildImage(
        {
          context: process.cwd()
        },
        { t: this.name }
      )
      return stream
    } else {
      const stream = await utils.docker.buildImage(
        {
          context: process.cwd()
        },
        { t: this.name }
      )
      const dockerode = new Dockerode()
      const log = await new Promise((resolve, reject) => {
        dockerode.modem.followProgress(stream, (err, res) =>
          err ? reject(err) : resolve(res)
        )
      })
      for (const line in log) {
        if (log[line].stream && log[line].stream.length > 1) {
          utils.log(log[line].stream.trim())
        }
      }
      return this.name
    }
  }
}
