import * as logger from '~/logger'
import { CommandPayload, CommandOptionsDefault } from '~/types'
import { getConfigPaths, getValidationErrors, parseMicroserviceConfig } from '~/services/config'

interface ActionOptions extends CommandOptionsDefault {
  json?: boolean
  silent?: boolean
}

export default async function validate({ options }: CommandPayload<ActionOptions>) {
  const configPaths = await getConfigPaths(options, true, false)
  const microserviceConfig = await parseMicroserviceConfig({
    configPath: configPaths.microservice,
    validate: false,
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
