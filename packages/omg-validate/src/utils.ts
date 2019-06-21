import * as _ from 'underscore'
import { scopes } from './schema/schemas'

export function getPossibleProperties(scope: string): string[] {
  let arr = []
  if (scope === 'root') {
    scope = 'microservice'
  }
  if (scopes.includes(scope)) {
    Object.keys(require(`./schema/schemas/${scope}`).properties).forEach(
      key => {
        arr.push(key)
      }
    )
  }
  return arr
}

/**
 * Value Setter
 *
 * @param  {any} val value
 * @param  {any} _else other value
 * @return {any} return value
 */
export function setVal(val: any, _else: any): any {
  if (_.isUndefined(val)) {
    return _else
  }
  return val
}

/**
 * Checks the interface
 *
 * @param  {any} microserviceJson provided microservice.yml as JSON
 * @return {void} no return value
 */
export function checkActionInterface(microserviceJson: any): void {
  if (microserviceJson.actions) {
    const actionMap = microserviceJson.actions
    for (const actionName of Object.keys(actionMap)) {
      const action = actionMap[actionName]
      const bools = [
        !!action.http,
        !!action.format,
        !!action.rpc,
        !!action.events
      ].filter(b => b)
      if (bools.length !== 1) {
        throw {
          text: `actions.${actionName} should have one of required property: 'http' 'format' 'rpc' or 'events'`
        }
      }
    }
  }
}

export const dataTypes = {
  int: (int: string): boolean => {
    return int.match(/^[-+]?\d+$/) !== null
  },
  float: (float: string): boolean => {
    return (
      !isNaN(parseFloat(float)) &&
      parseFloat(float)
        .toString()
        .indexOf('.') !== -1
    )
  },
  string: (string: string): boolean => {
    return true
  },
  uuid: (uuid: string): boolean => {
    return (
      uuid.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      ) !== null
    )
  },
  list: (list: string): boolean => {
    try {
      return (
        (Array.isArray(list) && typeof list === 'object') ||
        JSON.parse(list).toString() !== '[object Object]'
      )
    } catch (e) {
      return false
    }
  },
  map: (map: string): boolean => {
    try {
      return (
        (!Array.isArray(map) && typeof map === 'object') ||
        JSON.parse(map).toString() === '[object Object]'
      )
    } catch (e) {
      return false
    }
  },
  object: (object: string): boolean => {
    try {
      return (
        (!Array.isArray(object) && typeof object === 'object') ||
        JSON.parse(object).toString() === '[object Object]'
      )
    } catch (e) {
      return false
    }
  },
  boolean: (boolean: string): boolean => {
    return boolean === 'false' || boolean === 'true'
  },
  path: (path: string): boolean => {
    try {
      JSON.parse(path)
      return false
    } catch (e) {
      const lastChar = path.substr(path.length - 1)
      if (lastChar === '/') {
        return false
      }
      return typeof path === 'string'
    }
  },
  any: (any: string): boolean => {
    return true
  }
}

/**
 * Logs the string to STDOUT
 * @param  {string} string string to log
 */
export function log(string: string) {
  process.stdout.write(`${string}\n`)
}

/**
 * Logs the string to STDERR
 * @param  {string} string string to log
 */
export function error(string: string) {
  process.stderr.write(`${string}\n`)
}
