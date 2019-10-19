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
  let parsed
  let errorPosition: string | null = null

  try {
    parsed = jsYaml.safeLoad(await fs.readFile(options.configPath, 'utf8'))
  } catch (error) {
    if (error && error.name === 'YAMLException' && error.mark) {
      errorPosition = ` at Line ${error.mark.line} at Column ${error.mark.column}`
    }
  }

  if (typeof parsed !== 'object' || !parsed) {
    throw new CLIError(
      `Malformed config file (found at: ${options.configPath})\nIt's probably because of a syntax error${errorPosition} in the Config file.`,
    )
  }
  if (options.validate) {
    if (getValidationErrors(parsed).length) {
      logger.fatal(
        `Config file has errors (found at: ${options.configPath})\nRun 'omg validate' to get a detailed explanation.`,
      )
    }
  }

  return parsed
}
