import _get from 'lodash/get'

import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { executeAction } from '~/services/action'
import { lifecycleDisposables } from '~/common'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  args?: Args
  envs?: Args
  raw?: boolean
}

export default async function subscribe({ options, parameters }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })
  const [actionName, eventName] = parameters
  if (!actionName) {
    logger.fatal(`No action name specified`)
  }
  const actionConfig: ConfigSchemaAction = _get(microserviceConfig, ['actions', actionName])
  if (!actionConfig) {
    logger.fatal(`Action '${actionName}' not found. Try 'omg list' to get a list of available actions`)
  } else if (!actionConfig.events) {
    logger.fatal(`Action '${actionName}' has no events specified.`)
  }
  if (!actionConfig.events![eventName]) {
    logger.fatal(
      `Action '${actionName}' has no event named '${eventName}'. Try 'omg list' to get a list of available actions and their events.`,
    )
  }

  const daemon = new Daemon({ configPaths, microserviceConfig })
  await daemon.start({
    envs: options.envs || [],
    image: null,
    raw: !!options.raw,
  })
  logger.spinnerStart('Performing Healthcheck')
  if (!(await daemon.ping())) {
    logger.spinnerFail('Healthcheck failed')
    if (options.raw) {
      logger.error('Healthcheck failed')
    }
    process.exitCode = 1
    return
  }
  logger.spinnerSucceed('Healthcheck successful')

  logger.spinnerStart(`Subscribing to '${actionName}' / '${eventName}'`)
  const disposable = await executeAction({
    config: microserviceConfig,
    daemon,
    actionName,
    eventName,
    args: options.args || [],
    callback(response) {
      logger.info(`Event: ${JSON.stringify(response, null, 2)}`)
    },
  })

  if (disposable) {
    lifecycleDisposables.add(disposable)
  }
  logger.spinnerSucceed(`Successfully subscribed to event`)
}
