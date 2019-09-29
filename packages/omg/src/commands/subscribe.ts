import _get from 'lodash/get'

import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { executeAction, prepareActionArguments } from '~/services/action'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { lifecycleDisposables, HELP_OMG_LIST, HELP_OMG_LIST_DETAILS } from '~/common'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'

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
  const { missing: missingArgs, invalid: invalidArgs } = await prepareActionArguments({
    actionName,
    args: options.args || [],
    eventName,
    config: microserviceConfig,
  })
  if (missingArgs.length) {
    logger.error(`Missing argument${missingArgs.length > 1 ? 's' : ''}: ${missingArgs.join(', ')}`)
  }
  if (invalidArgs.length) {
    logger.error(`Invalid argument${invalidArgs.length > 1 ? 's' : ''}: ${invalidArgs.join(', ')}`)
  }
  if (missingArgs.length || invalidArgs.length) {
    logger.fatal('You can specify arguments with -a key="val"')
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
