import _get from 'lodash/get'
import * as logger from '~/logger'
import { executeAction } from '~/services/action'
import { Daemon } from '~/services/daemon'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { Args, CommandPayload, CommandOptionsDefault, ConfigSchemaAction } from '~/types'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: Args
  envs?: Args
  raw?: boolean
  debug?: boolean
  silent?: boolean
}

export default async function run({ options, parameters }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })
  const [actionName] = parameters
  if (!actionName) {
    logger.fatal(`No action name specified`)
  }
  const actionConfig: ConfigSchemaAction = _get(microserviceConfig, ['actions', actionName])
  if (!actionConfig) {
    logger.fatal(`Action '${actionName}' not found. Try 'omg list' to get a list of available actions`)
  } else if (actionConfig.events) {
    logger.fatal(`Action '${actionName}' is an event action. Try 'omg subscribe ${actionName} [event]' instead.`)
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
