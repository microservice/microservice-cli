import _ from 'underscore'
import { Command, Microservice } from 'oms-validate'
import { dataTypes } from './utils'

/**
 * Verifies the pattern, enum, and range of the given arguments.
 *
 * @param {Command} command The given {@link Command}
 * @param {Object} args The given argument mapping
 */
export function verifyArgumentConstrains(command: Command, args: any): void {
  command.arguments.forEach(a => {
    if (Object.keys(args).includes(a.name)) {
      const argumentValue = args[a.name]
      if (a.pattern !== null && argumentValue.match(a.pattern) === null) {
        throw `Argument: \`${a.name}\` must match regex: \`${a.pattern}\``
      }
      if (a.enum !== null && !a.enum.includes(argumentValue)) {
        throw `Argument: \`${a.name}\` must be one of: \`${a.enum.toString()}\``
      }
      if (a.range !== null) {
        if (!_.isUndefined(a.range.min) && argumentValue < a.range.min) {
          throw `Argument: \`${a.name}\` must be be no smaller than the value: \`${a.range.min}\``
        }
        if (!_.isUndefined(a.range.max) && argumentValue > a.range.max) {
          throw `Argument: \`${a.name}\` must be be no larger than the value: \`${a.range.max}\``
        }
      }
    }
  })
}

/**
 * Verifies the types of given arguments based off of the given {@link Action} or {@link Event}.
 *
 * @param {Command} command The given {@link Action} or {@link Event}
 * @param {Object} args The given argument mapping
 */
export function verifyArgumentTypes(command: Command, args: any): void {
  command.arguments.forEach(a => {
    if (Object.keys(args).includes(a.name)) {
      if (!dataTypes[a.type](args[a.name])) {
        throw `Argument: \`${a.name}\` must be of type: \`${a.type}\``
      }
    }
  })
}

/**
 * Verifies the types of the environment variables.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @param {Object} envs The given environment variable mapping
 */
export function verifyEnvironmentVariableTypes(microservice: Microservice, envs: any): void {
  microservice.environmentVariables.forEach(e => {
    if (Object.keys(envs).includes(e.name)) {
      if (!dataTypes[e.type](envs[e.name])) {
        throw `Environment variable: \`${e.name}\` must be of type: \`${e.type}\``
      }
    }
  })
}

/**
 * Verifies the patterns of the environment variables, if a pattern is defined.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @param {Object} envs The given environment variable mapping
 */
export function verifyEnvironmentVariablePattern(microservice: Microservice, envs: any): void {
  microservice.environmentVariables.forEach(e => {
    if (Object.keys(envs).includes(e.name)) {
      if (e.pattern !== null && envs[e.name].match(e.pattern) === null) {
        throw `Environment variable: \`${e.name}\` must match regex: \`${e.pattern}\``
      }
    }
  })
}

/**
 * Verifies the output type of a container.
 *
 * @param {Command} command The given {@link Action}
 * @param {String} output The given output
 */
export function verifyOutputType(command: Command, output: string) {
  if (command.output && command.output.type && !dataTypes[command.output.type](output)) {
    throw `Action: \`${command.name}\`` +
      ` must have output type: \`${command.output.type}\`` +
      ` instead got: \`${typeof output}\`` +
      ` ${output}`
  } else if (command.output && command.output.type && command.output.type === 'object') {
    const props = command.output.properties
    const json = JSON.parse(output)
    Object.keys(props).forEach(key => {
      if (props[key].type in dataTypes && !dataTypes[props[key].type](JSON.stringify(json[key]))) {
        const typeFound = (typeJson, typeKey): string => {
          if (typeof typeJson[typeKey] === 'number' && dataTypes.int(typeJson[typeKey].toString())) {
            return 'int'
          }
          if (dataTypes.float(typeJson[typeKey].toString())) {
            return 'float'
          }
          return typeof typeJson[typeKey]
        }
        throw `Action: \`${command.name}\`` +
          ` property \`${key}\` must have output type: \`${props[key].type}\`` +
          ` instead got: \`${typeFound(json, key)}\`` +
          `\n${output}`
      }
    })
  }
}

/**
 * If defined, verifies the output properties of a map or object.
 *
 * @param {Command} command  The given {@link Command}
 * @param {String} output The given output
 */
export function verifyProperties(command: Command, output: string) {
  const outputObject = JSON.parse(output)
  const { properties } = command.output
  const outputedProperties = Object.keys(outputObject)
  Object.keys(properties).forEach(property => {
    if (!(property in outputObject)) {
      throw `Action: \`${command.name}\`'s output does not have expected property: \`${property}\``
    }
    if (!dataTypes[properties[property].type](JSON.stringify(outputObject[property]))) {
      throw `Action: \`${command.name}\`'s output property: \`${property}\`` +
        ` must have type: \`${properties[property].type}\`` +
        ` instead got: \`${typeof outputObject[property]}\`:` +
        ` ${JSON.stringify(outputObject[property])}`
    }
    outputedProperties.splice(outputedProperties.indexOf(property), 1)
  })

  const extraPropertyCount = outputedProperties.length
  if (extraPropertyCount > 0) {
    throw `Action: \`${command.name}\` outputed ${extraPropertyCount} extra propert${
      extraPropertyCount === 1 ? 'y' : 'ies'
    }: \`${outputedProperties.toString()}\``
  }
}
