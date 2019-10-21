import _validateConfig from './validateConfig'
import _validateArgout, { ValidateArgoutOptions } from './validateArgout'
import { ConfigSchema, Action } from './types'

export default function validateConfig(config: ConfigSchema): string[] {
  const errors: string[] = []

  try {
    _validateConfig(config, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

// Argout = Argument + Output
export function validateArgout(options: ValidateArgoutOptions, value: any): string[] {
  const errors: string[] = []

  try {
    _validateArgout(options, value, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

export { ConfigSchema, Action }
