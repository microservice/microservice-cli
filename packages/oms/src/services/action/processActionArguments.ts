import { validateArgout } from '@microservices/validate'
import { InputType } from '@microservices/validate/src/types'
import argsToMap from '~/helpers/argsToMap'
import { CLIError } from '~/errors'
import { Args, ArgsTransformed, ConfigSchema, ConfigSchemaAction } from '~/types'

const TYPES_TO_JSON_DECODE: InputType[] = ['list', 'object', 'map', 'int', 'number', 'float', 'boolean']
// Non-object ones are added to eg. convert from String int to Number int before validation

interface ProcessActionArgumentsOptions {
  config: ConfigSchema
  actionName: string
  eventName?: string
  transform: boolean
  args: Args | ArgsTransformed
}

interface ProcessActionArgumentsResponse {
  extra: string[]
  missing: string[]
  invalid: string[]
  values: Record<string, any>
}

export default function processActionArguments({
  config,
  actionName,
  eventName,
  transform,
  args,
}: ProcessActionArgumentsOptions): ProcessActionArgumentsResponse {
  const action = (config.actions && config.actions[actionName]) || null
  const values: Record<string, any> = {}
  if (!action) {
    throw new CLIError(`Action#${actionName} not found`)
  }

  let actionArgs: ConfigSchemaAction['arguments']
  if (action.http) {
    actionArgs = action.arguments
  } else if (action.events) {
    if (!eventName) {
      throw new CLIError(`Missing event name for Action#${actionName}`)
    }
    const event = action.events[eventName]
    if (!event) {
      throw new CLIError(`Action '${actionName}' has no event named '${eventName}'`)
    }
    actionArgs = event.arguments
  }

  const extra: string[] = []
  const missing: string[] = []
  const invalid: string[] = []

  const argsMap = argsToMap(args)
  const argsNames = Object.keys(argsMap)
  const argsUsed = new Set()
  // Step 1 - Map
  Object.entries(actionArgs || {}).forEach(([argName, arg]) => {
    const value = argsMap[argName]
    if (typeof value !== 'undefined') {
      argsUsed.add(argName)
      if (value !== null) {
        // ^ Null is eq to undefined in storyscript world
        values[argName] = value
      }
    } else if (arg.required) {
      missing.push(argName)
    } else if (arg.default) {
      values[argName] = arg.default
    }
  })
  if (argsUsed.size !== argsNames.length) {
    extra.push(...argsNames.filter(item => !argsUsed.has(item)))
  }

  // Step 2 - Transform
  if (transform) {
    // We try to parse these args from the CLI in following types:
    // - JSON
    Object.entries(actionArgs || {}).forEach(([argName, arg]) => {
      let value = argsMap[argName]
      let changed = false
      if (typeof value !== 'string' || arg.type === 'string') {
        // We only unravel string args coming from CLI here
        return
      }
      if (TYPES_TO_JSON_DECODE.includes(arg.type)) {
        // Try to parse as JSON
        try {
          value = JSON.parse(value)
          changed = true
        } catch (_) {
          /* No op */
        }
      }
      if (changed) {
        values[argName] = value
      }
    })
  }

  // Step 3 - Validate
  Object.entries(actionArgs || {}).forEach(([argName, arg]) => {
    const value = argsMap[argName]
    if (typeof value === 'undefined') {
      // Skip missing ones
      return
    }

    invalid.push(...validateArgout(arg, value).map(item => `${argName}${item.slice(1)}`))
  })

  return { extra, missing, invalid, values }
}
