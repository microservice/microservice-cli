import Dockerode from 'dockerode'
import * as utils from '../utils'

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
  public constructor(name: string) {
    this.name = name
  }

  /**
   * Builds a Docker image with this {@link Build}'s name prefaced with `oms/` and tagged with `local`.
   *
   * @param {Boolean} [silent=false] The given boolean if output should be logged or not
   * @param  {boolean} [ui=false] The given boolean if ui mode is enabled or not
   * @return {String} The name of the docker container that was build
   */
  public async go(silent = false, ui = false): Promise<any> {
    if (ui) {
      const stream = await utils.docker.buildImage(
        {
          context: process.cwd(),
        },
        { t: this.name },
      )
      return stream
    }
    const stream = await utils.docker.buildImage(
      {
        context: process.cwd(),
      },
      { t: this.name },
    )
    const dockerode = new Dockerode()
    const log: any = await new Promise((resolve, reject) => {
      dockerode.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)))
    })
    if (!silent) {
      Object.values(log).forEach((logLine: any) => {
        if (logLine.stream && logLine.stream.length > 1) {
          utils.log(logLine.stream.trim())
        }
      })
    }
    return this.name
  }
}
