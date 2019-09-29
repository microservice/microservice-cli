import argsToMap from '~/helpers/argsToMap'
import { CLIError } from '~/errors'
import { Args, ConfigSchema, ConfigSchemaAction } from '~/types'

interface PrepareActionArgumentsOptions {
  config: ConfigSchema
  actionName: string
  eventName?: string
  args: Args
}
interface PrepareActionArgumentsResponse {
  missing: string[]
  invalid: string[]
  values: Record<string, any>
}

export default async function prepareActionArguments({
  config,
  actionName,
  eventName,
  args,
}: PrepareActionArgumentsOptions): Promise<PrepareActionArgumentsResponse> {
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
    if (!argsMap[argName]) {
      if (arg.required) {
        missing.push(argName)
      } else if (arg.default) {
        values[argName] = arg.default
      }
    } else {
      values[argName] = argsMap[argName]
    }
  })

  // TODO: Validate/transform types here

  return { missing, invalid, values }
}
