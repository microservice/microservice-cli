import validateConfig from './validateConfig'
import { ConfigSchema, Action } from './types'

export default function validate(config: ConfigSchema): string[] {
  const errors: string[] = []

  try {
    validateConfig(config, message => errors.push(message))
  } catch (error) {
    errors.push(`Error validating config: ${error.stack}`)
  }

  return errors
}

export { ConfigSchema, Action }
