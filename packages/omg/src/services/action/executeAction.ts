import { Daemon } from '~/services/daemon'
import { Args, ConfigSchema } from '~/types'
import argsToMap from '~/helpers/argsToMap'
import executeHttpAction from './executeHttpAction'

interface ExecuteActionOptions {
  daemon: Daemon
  config: ConfigSchema
  actionName: string
  args: Args
}

export default async function executeAction({ daemon, config, actionName, args }: ExecuteActionOptions): Promise<void> {
  const action = (config.actions && config.actions[actionName]) || null
  if (!action) {
    throw new Error(`Action#${actionName} not found`)
  }
  // Validate all actions have requested arguments
  const argsMap = argsToMap(args)
  const missingArgs: string[] = []
  Object.entries(action.arguments || {}).forEach(([argName, arg]) => {
    if (!arg.default && arg.required && !argsMap[argName]) {
      missingArgs.push(argName)
    }
  })
  if (missingArgs.length) {
    throw new Error(`Missing arguments for Action: ${missingArgs.join(', ')}`)
  }

  if (action.http != null) {
    return executeHttpAction({
      daemon,
      action,
      actionName,
      args,
    })
  }
  if (action.events != null) {
    console.log(action.events)
  }
  throw new Error(`Action#${actionName} has none of format/http/events specified`)
}
