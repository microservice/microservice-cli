import { DisposableLike } from 'event-kit'

import { Daemon } from '~/services/daemon'
import { Args, ConfigSchema } from '~/types'
import argsToMap from '~/helpers/argsToMap'

import executeHttpAction from './executeHttpAction'
import executeEventsAction from './executeEventsAction'

interface ExecuteActionOptions {
  daemon: Daemon
  config: ConfigSchema
  actionName: string
  eventName?: string
  args: Args
  callback: (payload: any) => void
}

export default async function executeAction({
  daemon,
  config,
  actionName,
  eventName,
  args,
  callback,
}: ExecuteActionOptions): Promise<null | DisposableLike> {
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
    const { response, disposable } = await executeHttpAction({
      daemon,
      action,
      actionName,
      args,
    })

    callback(response)

    return disposable
  }
  if (action.events != null) {
    if (!eventName) {
      throw new Error(`Missing event name for Action#${actionName}`)
    }

    const { disposable } = await executeEventsAction({
      daemon,
      args,
      action,
      actionName,
      eventName,
      callback,
    })

    return disposable
  }
  throw new Error(`Action#${actionName} has none of format/http/events specified`)
}
