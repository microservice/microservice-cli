import fs from 'sb-fs'
import jsYaml from 'js-yaml'
import * as logger from '~/logger'

import getValidationErrors from './getValidationErrors'
import { CLIError } from '~/errors'
import { ConfigSchema } from '~/types'

interface ParseMicroserviceConfigOptions {
  validate: boolean
  configPath: string
}

export default async function parseMicroserviceConfig(options: ParseMicroserviceConfigOptions): Promise<ConfigSchema> {
  const parsed = jsYaml.safeLoad(await fs.readFile(options.configPath, 'utf8'))
  if (typeof parsed !== 'object' || !parsed) {
    throw new CLIError(`Malformed config file (found at: ${options.configPath})`)
  }
  if (options.validate) {
    if (getValidationErrors(parsed).length) {
      logger.fatal(`Config file has errors (found at: ${options.configPath})`)
    }
  }

  return parsed
}
