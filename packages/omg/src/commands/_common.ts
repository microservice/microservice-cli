import * as logger from '~/logger'
import { processContainerEnv } from '~/services/docker'
import { prepareActionArguments } from '~/services/action'
import { Args, ConfigSchema } from '~/types'

interface ValidateActionArgumentsOptions {
  actionName: string
  eventName?: string
  args: Args
  config: ConfigSchema
}

export function validateActionArguments({ actionName, eventName, args, config }: ValidateActionArgumentsOptions): boolean {
  const { missing, invalid } = prepareActionArguments({
    actionName,
    eventName,
    args,
    config,
  })
  if (missing.length) {
    logger.error(`Missing argument${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`)
  }
  if (invalid.length) {
    logger.error(`Invalid argument${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`)
  }
  if (missing.length || invalid.length) {
    logger.info('You can specify arguments with -a key="val"')
    return false
  }
  return true
}

interface ValidateContainerEnvOptions {
  config: ConfigSchema
  inheritEnv: boolean
  envs: Args
}

export function validateContainerEnv({ config, inheritEnv, envs }: ValidateContainerEnvOptions) {
  const { missing } = processContainerEnv({ config, inheritEnv, envs })
  if (missing.length) {
    logger.error(`Missing environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`)
    return false
  }
  return true
}
