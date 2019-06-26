const validateForward = require('../schema/schema').forward

/**
 * Describes a Forward
 */
export default class Forward {
  private readonly _path: string
  private readonly _port: number
  private readonly _name: string

  /**
   * @param  {string} name forward name
   * @param  {any} rawForward raw forward from microservice
   * @param  {any} actionMap actionMap to compares available ports
   * @param  {any} forwardMap forwardMap to compares available ports
   */
  constructor(name: string, rawForward: any, actionMap: any, forwardMap: any) {
    const isValid = validateForward(rawForward)
    if (!isValid.valid) {
      isValid.text = isValid.text.replace(/data/g, `forward.${name}`)
      throw isValid
    }
    Object.keys(actionMap).forEach(actionName => {
      if (actionMap[actionName].http.port === rawForward.http.port) {
        throw {
          text: `Foward \`${name}\`: port ${
            rawForward.http.port
          } already used by action ${actionMap[actionName].name}`
        }
      }
    })
    Object.keys(forwardMap).forEach(forwardName => {
      if (forwardMap[forwardName].http.port === rawForward.http.port) {
        throw {
          text: `Foward \`${name}\`: port ${
            rawForward.http.port
          } already used by forward ${forwardMap[forwardName].name}`
        }
      }
    })
    this._path = rawForward.http.path
    this._port = rawForward.http.port
    this._name = name
  }

  /**
   * Gets and returns forward path
   *
   * @return {string} path
   */
  public get path(): string {
    return this._path
  }

  /**
   * Gets and returns forward port
   *
   * @return {number} port
   */
  public get port(): number {
    return this._port
  }

  /**
   * Gets and returns forward name
   *
   * @return {string} name
   */
  public get name(): string {
    return this._name
  }

  /**
   * Gets and returns forward http
   *
   * @return {any} http
   */
  public get http(): { path: string; port: number } {
    return { path: this._path, port: this._port }
  }
}
