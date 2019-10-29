import _get from 'lodash/get'
import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { HELP_OMS_LIST } from '~/common'
import { executeAction } from '~/services/action'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'
import { validateActionArguments, validateContainerEnv } from './_common'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: Args
  envs?: Args
  verbose?: boolean
  debug?: boolean
  silent?: boolean
  inheritEnv?: boolean
}

export default async function run({ options, parameters }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true, !options.image)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })
  const [actionName] = parameters
  if (!actionName) {
    logger.fatal(`No action name specified. ${HELP_OMS_LIST}`)
  }
  const actionConfig: ConfigSchemaAction = _get(microserviceConfig, ['actions', actionName])
  if (!actionConfig) {
    logger.fatal(`Action '${actionName}' not found. ${HELP_OMS_LIST}`)
  } else if (actionConfig.events) {
    logger.fatal(`Action '${actionName}' is an event action. Try 'oms subscribe ${actionName} [event]' instead.`)
  }
  const validatedEnv = validateContainerEnv({
    config: microserviceConfig,
    envs: options.envs || [],
    inheritEnv: !!options.inheritEnv,
  })
  const validatatedArguments = validateActionArguments({
    actionName,
    args: options.args || [],
    config: microserviceConfig,
  })
  if (!validatedEnv || !validatatedArguments) {
    return
  }

  const daemon = new Daemon({ configPaths, microserviceConfig })
  await daemon.start({
    envs: options.envs || [],
    image: options.image,
    verbose: !!options.verbose,
    inheritEnv: !!options.inheritEnv,
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
    if (options.verbose) {
      logger.error('Healthcheck failed')
    }
    process.exitCode = 1
    return
  }
  logger.spinnerSucceed('Healthcheck successful')
  logger.spinnerStart(`Running action '${actionName}'`)

  try {
    await executeAction({
      config: microserviceConfig,
      daemon,
      actionName,
      args: options.args || [],
      callback(response) {
        const responseToShow = typeof response === 'string' ? response : JSON.stringify(response, null, 2)
        if (options.silent) {
          logger.info(responseToShow)
        } else {
          logger.info(`Output: ${responseToShow}`)
        }
      },
    })
    logger.spinnerSucceed(`Ran action '${actionName}' successfully`)
  } finally {
    await daemon.stop()
  }
}
