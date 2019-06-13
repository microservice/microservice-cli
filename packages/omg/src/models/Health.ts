const validateHealth = require('../schema/schema').health

/**
 * Defines health object from microservice.yml
 * This object is complient with the Docker API.
 * See https://docs.docker.com/engine/api/v1.37/#operation/ContainerCreate
 */
export default class Health {
  private readonly _path: string
  private readonly _port: number

  /**
   * @param  {any} rawHealth Health json object from microservice.yml
   */
  constructor(rawHealth: any) {
    const isValid = validateHealth(rawHealth)

    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, 'health')
      throw isValid
    }

    this._path = rawHealth.http.path
    this._port = rawHealth.http.port
  }

  /**
   * Getter for health port
   *
   * @return {number} port number
   */
  public get port(): number {
    return this._port
  }

  /**
   * Getter for health path
   *
   * @return {string} path
   */
  public get path(): string {
    return this._path
  }
}
