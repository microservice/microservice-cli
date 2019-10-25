import open from 'open'

import * as logger from '~/logger'
import { CLIError } from '~/errors'
import { Dashboard } from '~/services/dashboard'
import { pingDaemon } from '~/services/docker'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'

interface ActionOptions extends CommandOptionsDefault {
  port?: string
  open: boolean
  image?: string
  inheritEnv?: boolean
}

export default async function ui({ options }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true, !options.image)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })

  if (!options.image && !(await pingDaemon())) {
    throw new CLIError('Docker daemon must be running before build images')
  }

  logger.spinnerStart('Booting up UI')
  const dashboard = new Dashboard({
    image: options.image || null,
    inheritEnv: !!options.inheritEnv,
    configPaths,
    microserviceConfig,
  })
  const { port } = await dashboard.start({
    port: parseInt(options.port || '', 10) || null,
  })

  const serverUrl = `http://localhost:${port}/`
  logger.spinnerSucceed(`Server is running at ${serverUrl}`)
  if (options.open) {
    await open(serverUrl)
  }
}
