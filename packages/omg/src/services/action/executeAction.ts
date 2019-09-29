import { DisposableLike } from 'event-kit'

import { CLIError } from '~/errors'
import { Daemon } from '~/services/daemon'
import { Args, ConfigSchema } from '~/types'

import executeHttpAction from './executeHttpAction'
import executeEventsAction from './executeEventsAction'
import processActionArguments from './processActionArguments'

interface ExecuteActionOptions {
  daemon: Daemon
  config: ConfigSchema
  actionName: string
  eventName?: string
  args: Args
  callback: (payload: any) => void | Promise<void>
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
    throw new CLIError(`Action#${actionName} not found`)
  }

  // Validate all actions have requested arguments
  const { missing: missingArgs, invalid: invalidArgs, values: argsMap } = processActionArguments({
    actionName,
    eventName,
    args,
    config,
  })
  if (missingArgs.length || invalidArgs.length) {
    const chunks: string[] = []
    if (missingArgs.length) {
      chunks.push(`${missingArgs.join(', ')} are missing`)
    }
    if (invalidArgs.length) {
      chunks.push(`${invalidArgs.join(', ')} are invalid`)
    }
    throw new CLIError(`Invalid arguments for Action#${actionName}: ${chunks.join(' and ')}`)
  }

  if (action.http != null) {
    const { response, disposable } = await executeHttpAction({
      daemon,
      action,
      actionName,
      argsMap,
    })

    callback(response)

    return disposable
  }
  if (action.events != null) {
    if (!eventName) {
      throw new CLIError(`Missing event name for Action#${actionName}`)
    }

    const { disposable } = await executeEventsAction({
      daemon,
      argsMap,
      action,
      actionName,
      eventName,
      callback,
    })

    return disposable
  }
  throw new CLIError(`Action#${actionName} has none of http/events specified`)
}
