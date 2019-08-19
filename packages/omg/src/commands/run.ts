import _get from 'lodash/get'
import * as logger from '~/logger'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { Daemon } from '~/services/daemon'

interface ActionOptions extends CommandOptionsDefault {
  image?: string
  args?: [string, string][]
  envs?: [string, string][]
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
}
