import _get from 'lodash/get'
import * as logger from '~/logger'
import { Daemon } from '~/services/daemon'
import { HELP_OMG_LIST } from '~/common'
import { executeAction } from '~/services/action'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'
import { validateActionArguments, validateContainerEnv } from './_common'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: Args
  envs?: Args
  raw?: boolean
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
    logger.fatal(`No action name specified. ${HELP_OMG_LIST}`)
  }
  const actionConfig: ConfigSchemaAction = _get(microserviceConfig, ['actions', actionName])
  if (!actionConfig) {
    logger.fatal(`Action '${actionName}' not found. ${HELP_OMG_LIST}`)
  } else if (actionConfig.events) {
    logger.fatal(`Action '${actionName}' is an event action. Try 'omg subscribe ${actionName} [event]' instead.`)
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
    raw: !!options.raw,
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
    if (options.raw) {
      logger.error('Healthcheck failed')
    }
    process.exitCode = 1
    return
  }
  logger.spinnerSucceed('Healthcheck successful')
  logger.spinnerStart(`Running action '${actionName}'`)

  await executeAction({
    config: microserviceConfig,
    daemon,
    actionName,
    args: options.args || [],
    callback(response) {
      if (options.silent) {
        logger.info(response && typeof response === 'object' ? JSON.stringify(response, null, 2) : response)
      } else {
        logger.info(`Output: ${JSON.stringify(response, null, 2)}`)
      }
    },
  })
  logger.spinnerSucceed(`Ran action '${actionName}' successfully`)

  await daemon.stop()
}
