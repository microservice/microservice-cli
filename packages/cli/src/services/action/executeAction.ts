import { DisposableLike } from 'event-kit'

import { CLIError } from '~/errors'
import { Daemon } from '~/services/daemon'
import { Args, ArgsTransformed, ConfigSchema } from '~/types'

import executeHttpAction from './executeHttpAction'
import executeEventsAction from './executeEventsAction'
import processActionArguments from './processActionArguments'

interface ExecuteActionOptions {
  daemon: Daemon
  config: ConfigSchema
  actionName: string
  eventName?: string
  args?: Args
  transformedArgs?: ArgsTransformed
  // ^ These are non-string args that come from UI or something
  // their values are non-string and don't need to be transformed
  callback: (payload: any) => void | Promise<void>
}

export default async function executeAction({
  daemon,
  config,
  actionName,
  eventName,
  args,
  transformedArgs,
  callback,
}: ExecuteActionOptions): Promise<null | DisposableLike> {
  const action = (config.actions && config.actions[actionName]) || null
  if (!action) {
    throw new CLIError(`Action#${actionName} not found`)
  }

  // Validate all actions have requested arguments
  const { extra: extraArgs, missing: missingArgs, invalid: invalidArgs, values: argsMap } = processActionArguments({
    actionName,
    eventName,
    args: transformedArgs || (args as Args),
    config,
    transform: !transformedArgs,
  })
  const totalCount = missingArgs.length + invalidArgs.length + extraArgs.length
  if (totalCount > 0) {
    const chunks: string[] = []
    if (missingArgs.length) {
      chunks.push(`${missingArgs.join(', ')} ${missingArgs.length > 1 ? 'are' : 'is'} missing`)
    }
    if (invalidArgs.length) {
      chunks.push(`${invalidArgs.join(', ')} ${invalidArgs.length > 1 ? 'are' : 'is'} invalid`)
    }
    if (extraArgs.length) {
      chunks.push(`${extraArgs.join(', ')} ${extraArgs.length > 1 ? 'are' : 'is'} unrecognized`)
    }
    throw new CLIError(`Invalid argument${totalCount > 1 ? 's' : ''} for Action#${actionName}: ${chunks.join(' and ')}`)
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
