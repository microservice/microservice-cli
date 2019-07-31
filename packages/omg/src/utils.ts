import _ from 'underscore'
import $ from 'shelljs'
import fs from 'fs'
import path from 'path'
import getPort from 'get-port'
import { EnvironmentVariable, Microservice } from 'omg-validate'

import LineUp from 'lineup'
import Docker from 'dockerode-promise'
import { exec as execCmd } from 'child_process'

import manifest from '../package.json'

const lineup = new LineUp()
export const docker = new Docker()
let versionAvailable = false

/**
 * Promise wrapper for the `exec`.
 *
 * @param {String} command The command to run
 * @param {Boolean} [silent=true] True if silent, otherwise false
 * @return {Promise<String>} The stdout if resolved, otherwise stderror unless stderror is empty
 */
export function exec(command: string, silent: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    $.exec(command, { silent }, (code, stdout, stderr) => {
      if (code !== 0) {
        if (stderr === '') {
          reject(stdout.trim())
        } else {
          reject(stderr.trim())
        }
      } else if (stdout === '') {
        resolve(stderr.trim())
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * Used to set values in the constructors of the microservice classes.
 *
 * @param {*} val The value to set
 * @param {*} _else The value to set if val if not defined
 * @return {*} The value
 */
export function setVal(val: any, _else: any): any {
  if (_.isUndefined(val)) {
    return _else
  }
  return val
}
/**
 * @param  {number} ms Time to sleep in milliseconds
 * @return {Promise} Promise to await
 */
export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get's the ports that need to be open defined by the given {@link Microservice}.
 *
 * @param {Microservice} microservice The given {@link Microservice}
 * @return {Array<Integer>} The ports that need to be opened for the given {@link Microservice}
 */
export function getNeededPorts(microservice: Microservice): number[] {
  const ports = []
  for (let i = 0; i < microservice.actions.length; i += 1) {
    const action = microservice.actions[i]
    if (action.http !== null) {
      if (!ports.includes(action.http.port)) {
        ports.push(action.http.port)
      }
    }
    if (action.events !== null) {
      for (let j = 0; j < action.events.length; j += 1) {
        if (!ports.includes(action.events[j].subscribe.port)) {
          ports.push(action.events[j].subscribe.port)
        }
        if (action.events[j].unsubscribe && !ports.includes(action.events[j].unsubscribe.port)) {
          ports.push(action.events[j].unsubscribe.port)
        }
      }
    }
  }
  for (let i = 0; i < microservice.forwards.length; i += 1) {
    const forward = microservice.forwards[i]
    if (forward.http !== null) {
      ports.push(forward.http.port)
    }
  }
  if (microservice.health && microservice.health.port !== null && !ports.includes(microservice.health.port)) {
    ports.push(microservice.health.port)
  }
  return ports
}

/**
 * Gets the ports that need to be open defined by the given {@link Microservice}.
 *
 * @param  {Microservice} microservice
 * @return {number[]} ports Bond ports
 */
export function getForwardPorts(microservice: Microservice): number[] {
  const ports = []
  for (let i = 0; i < microservice.forwards.length; i += 1) {
    const forward = microservice.forwards[i]
    if (forward.http !== null) {
      ports.push(forward.http.port)
    }
  }
  return ports
}
/**
 * Return the health port
 *
 * @param  {Microservice} microservice Provided microservice as a JSON
 * @return {number} port number
 */
export function getHealthPort(microservice: Microservice): number {
  return microservice.health.port
}

/**
 * Creates a name for the Docker images based of the git remote -v.
 *
 * @param {boolean} ui Defines if UI mode is enabled or not
 * @return {Promise<String>} The image name
 */
export async function createImageName(ui: boolean = false): Promise<string | any> {
  try {
    const data = await exec('git remote -v')
    if (data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)) {
      return ui
        ? `${data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)[1].toLowerCase()}`
        : `omg/${data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)[1].toLowerCase()}`
    }
    return ui
      ? `${data.match(/https:\/\/github\.com\/(\w+\/[\w|.|-]+)/)[1].toLowerCase()}`
      : `omg/${data.match(/https:\/\/github\.com\/(\w+\/[\w|.|-]+)/)[1].toLowerCase()}`
  } catch (e) {
    if (ui) {
      return {
        owner: `${Buffer.from(process.cwd())
          .toString('base64')
          .toLowerCase()
          .replace(/=/g, '')}`,
        generated: true,
      }
    }
    return `omg/${Buffer.from(process.cwd())
      .toString('base64')
      .toLowerCase()
      .replace(/=/g, '')}`
  }
}

/**
 * Turns a list of string with a delimiter to a map.
 *
 * @param {Array<String>} list The given list of strings with delimiter
 * @param {String} errorMessage The given message to used when unable to parse
 * @return {Object} Key value of the list
 */
export function parse(list: string[], errorMessage: string): any {
  const dictionary = {}
  for (let i = 0; i < list.length; i += 1) {
    const split = list[i].split(/=(.+)/)
    if (split.length !== 3) {
      throw {
        message: errorMessage,
      }
    }
    const [k, v] = split
    dictionary[k] = v
  }
  return dictionary
}

/**
 * Matches the case of given cli environment arguments to the case defined in
 * the microservice.yml.
 *
 * @param {Object} env The given environment variable mapping
 * @param {Array<EnvironmentVariable>} environmentVariables The given {@link EnvironmentVariable}s
 * @return {Object} The environment mapping with correct cases
 */
export function matchEnvironmentCases(env: any, environmentVariables: EnvironmentVariable[]): any {
  const result = {}
  Object.keys(env).forEach(key => {
    environmentVariables.forEach(cap => {
      if (cap.name.toLowerCase() === key.toLowerCase()) {
        result[cap.name] = env[key]
      }
    })
  })
  return result
}

/**
 * Checks if a docker container exists with the given name.
 *
 * @param {String} name The given name
 * @param {Array<Object>} containers The given containers
 * @return {Boolean} True if it exists, otherwise, false
 */
export function doesContainerExist(name: string, containers: any[]): boolean {
  for (let i = 0; i < containers.length; i += 1) {
    for (let j = 0; j < containers[i].RepoTags.length; j += 1) {
      if (containers[i].RepoTags[j].includes(name)) {
        return true
      }
    }
  }
  return false
}

/**
 * Log a string to stdout.
 *
 * @param {String} string The given sting to log
 */
export function log(string: string) {
  process.stdout.write(`${string}\n`)
}

/**
 * Log a string to stderr.
 *
 * @param {String} string The given string to log
 */
export function error(string) {
  process.stderr.write(`${string}\n`)
}

export const typeCast = {
  int: (int: string): number => parseInt(int, 10),
  float: (float: string): number => parseFloat(float),
  string: (string: string): string => string,
  uuid: (uuid: string): string => uuid,
  list: (list: any): any[] => JSON.parse(list),
  map: (map: string): any => JSON.parse(map),
  object: (object: string): any => JSON.parse(object),
  boolean: (boolean: string): boolean => boolean === 'true',
  path: (entryPath: string): string => entryPath,
  any: (any: any): any => any,
}

export const dataTypes = {
  int: (int: string): boolean => {
    return int.toString().match(/^[-+]?\d+$/) !== null
  },
  float: (float: string): boolean => {
    return (
      !Number.isNaN(parseFloat(float)) &&
      parseFloat(float)
        .toString()
        .indexOf('.') !== -1
    )
  },
  string: (string: string): boolean => {
    return true
  },
  uuid: (uuid: string): boolean => {
    return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/) !== null
  },
  list: (list: string): boolean => {
    try {
      return (Array.isArray(list) && typeof list === 'object') || JSON.parse(list).toString() !== '[object Object]'
    } catch (e) {
      return false
    }
  },
  map: (map: string): boolean => {
    try {
      return (!Array.isArray(map) && typeof map === 'object') || JSON.parse(map).toString() === '[object Object]'
    } catch (e) {
      return false
    }
  },
  object: (object: string): boolean => {
    try {
      return (!Array.isArray(object) && typeof object === 'object') || JSON.parse(object).toString() === '[object Object]'
    } catch (e) {
      return false
    }
  },
  boolean: (boolean: string): boolean => {
    return boolean === 'false' || boolean === 'true'
  },
  path: (entryPath: string): boolean => {
    try {
      JSON.parse(entryPath)
      return false
    } catch (e) {
      const lastChar = entryPath.substr(entryPath.length - 1)
      if (lastChar === '/') {
        return false
      }
      return typeof entryPath === 'string'
    }
  },
  any: (any: string): boolean => {
    return true
  },
}

/**
 * Get's an open port.
 *
 * @return {Promise<Number>} The open port
 */
export function getOpenPort(increment: number = 0): Promise<number> {
  return getPort({ port: getPort.makeRange(8000 + increment, 9000) })
}

/**
 * Used to append the environment variable options into [args...].
 *
 * @param {Array} xs
 * @return {function(*=): (*|Array)}
 */
export function appender(givenXs: any[] = []): (...args: any) => any {
  const xs = givenXs || []
  return x => {
    xs.push(x)
    return xs
  }
}

/**
 * Checks if any action in he given microserviceJson does not have
 * and interface (http, format, rpc, xor events).
 *
 * @param {Object} microserviceJson The given microservice json
 * @throws {Object} Throws error if more, or less than one interface
 *                  is given for an action
 */
export function checkActionInterface(microserviceJson: any): void {
  if (microserviceJson.actions) {
    const actionMap = microserviceJson.actions

    Object.keys(actionMap).forEach(actionName => {
      const action = actionMap[actionName]
      const bools = [!!action.http, !!action.format, !!action.rpc, !!action.events].filter(b => b)
      if (bools.length !== 1) {
        throw {
          text: `actions.${actionName} should have one of required property: 'http' 'format' 'rpc' or 'events'`,
        }
      }
    })
  }
}

/**
 * Checks if the current version is up to date with the published one
 */
export function checkVersion() {
  execCmd(
    'npm view omg version',
    {
      encoding: 'utf8',
    },
    (e, out, err) => {
      if (out) {
        const versions = {
          local: manifest.version.trim().match(/^(\d+).(\d+).(\d+)/),
          distant: out
            .toString()
            .trim()
            .match(/^(\d+).(\d+).(\d+)/),
        }
        for (let i = 1; i <= 3; i += 1) {
          if (versions.distant[i] > versions.local[i]) {
            let updateLabel = 'Patch'
            if (i === 1) {
              updateLabel = 'Major'
            } else if (i === 2) {
              updateLabel = 'Minor'
            }

            lineup.sticker.note('')
            lineup.sticker.note(
              `${lineup.colors.yellow(`${updateLabel} update available: `)}${lineup.colors.red(
                versions.local[0],
              )} ${lineup.colors.yellow('=>')} ${lineup.colors.green(versions.distant[0])}`,
            )
            lineup.sticker.note(`${lineup.colors.yellow(`Run: 'npm i -g omg' or 'yarn global add omg' to update`)}`)
            lineup.sticker.note('')
            versionAvailable = true
          }
        }
      }
    },
  )
}

/**
 * If the CLI is outdated, posts a warning in the terminal
 */
export function showVersionCard() {
  if (versionAvailable) {
    lineup.sticker.show({
      align: 'center',
      color: 'red',
    })
  }
}

/**
 * @return {string} Content of the microservice file
 */
export function readMicroserviceFile(): string {
  let content = ''
  try {
    content = fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString()
  } catch {
    try {
      content = fs.readFileSync(path.join(process.cwd(), 'microservice.yaml')).toString()
    } catch {
      content = ''
    }
  }
  return content
}

/**
 * @return {string} microservice file path
 */
export function getMicroserviceFilePath(): string {
  if (fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
    return path.join(process.cwd(), 'microservice.yml')
  }
  if (fs.existsSync(path.join(process.cwd(), 'microservice.yaml'))) {
    return path.join(process.cwd(), 'microservice.yaml')
  }
  return null
}
