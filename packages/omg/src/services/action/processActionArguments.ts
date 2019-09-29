import argsToMap from '~/helpers/argsToMap'
import { CLIError } from '~/errors'
import { Args, ConfigSchema, ConfigSchemaAction } from '~/types'

interface ProcessActionArgumentsOptions {
  config: ConfigSchema
  actionName: string
  eventName?: string
  args: Args
}

interface ProcessActionArgumentsResponse {
  missing: string[]
  invalid: string[]
  values: Record<string, any>
}

export default function processActionArguments({
  config,
  actionName,
  eventName,
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

  const missing: string[] = []
  const invalid: string[] = []

  const argsMap = argsToMap(args)
  Object.entries(actionArgs || {}).forEach(([argName, arg]) => {
    const value = argsMap[argName]
    if (typeof value !== 'undefined') {
      values[argName] = value
    } else {
      if (arg.required) {
        missing.push(argName)
      } else if (arg.default) {
        values[argName] = arg.default
      }
    }
  })

  // TODO: Validate/transform types here

  return { missing, invalid, values }
}
