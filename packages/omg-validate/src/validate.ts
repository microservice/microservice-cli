/* eslint-disable class-methods-use-this */
// TODO: ^ disable this

import yamljs from './wrapper/yamljs'
import * as utils from './utils'
import Microservice from './models/Microservice'
import { scopes } from './schema/schemas'

/**
 * OMGValidate class
 * Used to validate microservice.yml.
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
  public constructor(microservice: string, opts?: any) {
    this._microservice = microservice
    this._opts = opts || {}
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
      yamljs.parse(file)
      return yamljs.load(file)
    } catch (e) {
      utils.error(`Issue with microservice.yml:\n${e}`)
      process.exit(1)
      throw new Error('Pasing failed')
      // ^ Pure cosmetic since we called process.exit() earlier
      // Just to suppress type checker
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
    }
    if (options.silent) {
      return ''
    }
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
    const formattedError = [`${errorCount} error${errorCount === 1 ? '' : 's'} found:`]
    for (let i = 0; i < errors.length; i += 1) {
      const generalScope = errors[i].split(' ')[0].split('.')
      const scope = generalScope[generalScope.length - 1]
      let error = errors[i]
      if (scopes.includes(scope)) {
        let str = `should only have theses properties:`
        utils.getPossibleProperties(scope).forEach(prop => {
          str = `${str}\n    '${prop}'`
        })
        error = errors[i].replace('should NOT have additional properties', str)
      }
      formattedError.push(`\n  ${i + 1}. ${error}`)
    }
    return formattedError.join('')
  }
}
