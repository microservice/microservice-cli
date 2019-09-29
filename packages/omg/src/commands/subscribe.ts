import _get from 'lodash/get'

import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { executeAction } from '~/services/action'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { lifecycleDisposables, HELP_OMG_LIST, HELP_OMG_LIST_DETAILS } from '~/common'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'
import { validateActionArguments, validateContainerEnv } from './_common'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: Args
  envs?: Args
  raw?: boolean
  debug?: boolean
  silent?: boolean
}

export default async function subscribe({ options, parameters }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })
  const [actionName, eventName] = parameters
  if (!actionName) {
    logger.fatal(`No action name specified. ${HELP_OMG_LIST}`)
  }
  const actionConfig: ConfigSchemaAction = _get(microserviceConfig, ['actions', actionName])
  if (!actionConfig) {
    logger.fatal(`Action '${actionName}' not found. ${HELP_OMG_LIST}`)
  } else if (!actionConfig.events) {
    logger.fatal(`Action '${actionName}' has no events specified. ${HELP_OMG_LIST}`)
  }
  if (!actionConfig.events![eventName]) {
    logger.fatal(`Action '${actionName}' has no event named '${eventName}'. ${HELP_OMG_LIST_DETAILS}`)
  }
  const validatatedArguments = validateActionArguments({
    actionName,
    eventName,
    args: options.args || [],
    config: microserviceConfig,
  })
  const validatedEnv = validateContainerEnv({
    config: microserviceConfig,
    envs: options.envs || [],
    inheritEnv: false,
    // TODO: ^ Fix this
  })
  if (!validatedEnv || !validatatedArguments) {
    return
  }

  const daemon = new Daemon({ configPaths, microserviceConfig })
  await daemon.start({
    envs: options.envs || [],
    image: options.image,
    raw: !!options.raw,
  })
  if (options.debug) {
    const daemonLogger = await daemon.getLogs()
    daemonLogger.onLogLine(line => {
      logger.info(line)
    })
    daemonLogger.onErrorLine(line => {
      logger.error(line)
    })
  }

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
      if (options.silent) {
        logger.info(response && typeof response === 'object' ? JSON.stringify(response, null, 2) : response)
      } else {
        logger.info(`Event received: ${JSON.stringify(response, null, 2)}`)
      }
    },
  })

  if (disposable) {
    lifecycleDisposables.add(disposable)
  }
  logger.spinnerSucceed(`Successfully subscribed to event`)
}
