import * as logger from '~/logger'
import { getConfigPaths, getValidationErrors, parseMicroserviceConfig } from '~/services/config'
import { ActionPayload, ActionOptionsDefault } from '~/types'

interface ActionOptions extends ActionOptionsDefault {
  json?: boolean
  silent?: boolean
}

export default async function validate({ options }: ActionPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
  })
  const validationErrors = getValidationErrors(microserviceConfig)
  if (!validationErrors.length) {
    if (!options.silent) {
      if (options.json) {
        logger.info(JSON.stringify({ status: 'ok' }))
      } else {
        logger.info('Configuration passed validation successfully')
      }
    }
  } else {
    process.exitCode = 1
    if (options.json) {
      logger.error(JSON.stringify({ status: 'error', errors: validationErrors }))
    } else {
      logger.error(
        `Validation failed with the following errors: \n${validationErrors.map(item => `  - ${item}`).join('\n')}`,
      )
    }
  }
}
