import { Dashboard } from '~/services/dashboard'
import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { CommandPayload, CommandOptionsDefault } from '~/types'

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

  const dashboard = new Dashboard({
    configPaths,
    microserviceConfig,
  })
  dashboard.start({
    port: parseInt(options.port || '', 10) || null,
    inheritEnv: !!options.inheritEnv,
  })
}
