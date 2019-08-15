import { getConfigPaths, parseMicroserviceConfig } from '~/services/config'
import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  json?: boolean
  details?: boolean
}

export default async function list({ options }: ActionPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
  })

  console.log('List command', microserviceConfig)
}
