const validateForward = require('../schema/schema').forward

export default class Forward {
  private readonly _path: string
  private readonly _port: number
  private readonly _name: string

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

  public get path(): string {
    return this._path
  }

  public get port(): number {
    return this._port
  }

  public get name(): string {
    return this._name
  }

  public get http(): { path: string; port: number } {
    return { path: this._path, port: this._port }
  }
}
