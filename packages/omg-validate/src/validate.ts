import yamljs from './wrapper/yamljs'
import * as utils from './utils'
import Microservice from './models/Microservice'

/**
 * OMGValidate class
 * Used to validate microservice.yml
 */
export default class OMGValidate {
  private readonly _microservice: string
  private readonly _opts: any

  /**
   * Constructor
   *
   * @param  {string} microservice microservice.yml as a string
   * @param  {any} opts optionnal options mostly used by omg-cli
   */
  constructor(microservice: string, opts?: any) {
    this._microservice = microservice
    this._opts = opts ? opts : {}
  }

  /**
   * Validates the microservice.yml
   *
   * @return {any} Success or error message
   */
  public validate(): any {
    const json = this.readYAML(this._microservice)
    const options = this._opts
    try {
      utils.checkActionInterface(json)
      const m = new Microservice(json)
      return this.processValidateOutput(m.rawData, options)
    } catch (e) {
      throw this.processValidateOutput(e, options)
    }
  }

  /**
   * YAML Parser
   *
   * @param  {string} file microservice.yml
   * @return {string} parsing result
   */
  private readYAML(file: string): string {
    try {
      return yamljs.parse(file)
    } catch (e) {
      return `Issue with microservice.yml: ${e.message}`
    }
  }

  /**
   * Generates validation output
   *
   * @param  {any} data Validation result object
   * @param  {any} options Provided options
   * @return {string} output
   */
  private processValidateOutput(data: any, options: any): string {
    if (options.json) {
      return JSON.stringify(data, null, 2)
    } else if (options.silent) {
      return ''
    } else {
      let errorString
      if (!data.text) {
        errorString = `${data.context} has an issue. ${data.message}`
      } else {
        errorString = data.text
      }
      if (errorString === 'No errors') {
        return errorString
      }
      const errors = errorString.split(', ')
      const errorCount = errors.length
      const formattedError = [
        `${errorCount} error${errorCount === 1 ? '' : 's'} found:`
      ]
      for (let i = 0; i < errors.length; i += 1) {
        formattedError.push(`\n  ${i + 1}. ${errors[i]}`)
      }
      return formattedError.join('')
    }
  }
}
