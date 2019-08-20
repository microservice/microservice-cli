import _get from 'lodash/get'
import * as logger from '~/logger'
import { Args, CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { executeAction } from '~/services/action'
import { Daemon } from '~/services/daemon'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: Args
  envs?: Args
  raw?: boolean
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
  if (!_get(microserviceConfig, ['actions', actionName])) {
    logger.fatal(`Action '${actionName}' not found. Try 'omg list' to get a list of available actions`)
  }

  const daemon = new Daemon({ configPaths, microserviceConfig })
  await daemon.start({
    envs: options.envs || [],
    image: options.image,
    raw: !!options.raw,
  })
  logger.spinnerStart('Performing Healthcheck')
  const status = await daemon.ping()
  if (!status) {
    logger.spinnerFail('Healthcheck failed')
    if (options.raw) {
      logger.error('Healthcheck failed')
    }
    process.exitCode = 1
    return
  }
  logger.spinnerSucceed('Healthcheck successful')
  logger.spinnerStart(`Running action '${actionName}'`)

  const response = await executeAction({
    config: microserviceConfig,
    daemon,
    actionName,
    args: options.args || [],
  })
  console.log('response', response)
}
