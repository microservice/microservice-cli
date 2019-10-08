import { ConfigSchema } from './types'

export function getRandomString() {
  return Math.random()
    .toString(36)
    .slice(2)
}

export function configHasRequiredEnvs(config: ConfigSchema, envValues: Record<string, string>): boolean {
  if (config && config.environment && typeof config.environment === 'object') {
    for (const key in config.environment) {
      if (!{}.hasOwnProperty.call(config.environment, key)) {
        continue
      }

      const value = config.environment[key]
      if (value && typeof value === 'object' && value.required && !envValues[key]) {
        return true
      }
    }
  }

  return false
}
