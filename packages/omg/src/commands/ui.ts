import open from 'open'

import * as logger from '~/logger'
import { Dashboard } from '~/services/dashboard'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'

interface ActionOptions extends CommandOptionsDefault {
  port?: string
  open: boolean
  inheritEnv?: boolean
}

export default async function ui({ options }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: true,
  })

  logger.spinnerStart('Booting up UI')
  const dashboard = new Dashboard({
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
