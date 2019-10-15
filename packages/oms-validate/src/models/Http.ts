const validateHttp = require('../schema/schema').http

/**
 * Describes a http setup.
 */
export default class Http {
  private readonly _method: string
  private readonly _port: number
  private readonly _path: string
  private readonly _contentType: string

  /**
   * Builds an {@link Http} setup.
   *
   * @param {String} commandName The name of the command that interfaces via http
   * @param {Object} rawHttp The given raw data
   * @param {String} pathToHttp Path in the `microservice.yml` file to this {@link Http}
   * @param {Integer} [port] If no port given on rawHttp, this port will be used
   */
  public constructor(commandName: string, rawHttp: any, pathToHttp: string, port: number = null) {
    if (!rawHttp.port && port) {
      // eslint-disable-next-line no-param-reassign
      rawHttp.port = port
    }
    const isValid = validateHttp(rawHttp)
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, pathToHttp)
      throw isValid
    }
    this._method = rawHttp.method
    this._port = rawHttp.port
    this._path = rawHttp.path
    this._contentType = rawHttp.contentType
  }

  /**
   * Get's the method of this {@link Http}.
   *
   * @return {String} The method
   */
  public get method(): string {
    return this._method
  }

  /**
   * Gets the port of this {@link Http}.
   *
   * @return {Integer} The port
   */
  public get port(): number {
    return this._port
  }

  /**
   * Gets the path of this {@link Http}.
   *
   * @return {String} The endpoint
   */
  public get path(): string {
    return this._path
  }

  /**
   * Gets the content type of this {@link Http}.
   *
   * @return {String} The content type
   */
  public get contentType(): string {
    return this._contentType
  }
}
