import { ConfigSchema } from './types'

export function getRandomString() {
  return Math.random()
    .toString(36)
    .slice(2)
}

export function configHasRequiredEnvs(config: ConfigSchema, envValues: Record<string, string>): boolean {
  let hasRequiredEnvs = false

  if (config && typeof config === 'object') {
    const { environment } = config

    if (environment && typeof environment === 'object') {
      Object.keys(environment).forEach(key => {
        const value = environment[key]
        if (value && typeof value === 'object' && value.required && !envValues[key]) {
          hasRequiredEnvs = true
        }
      })
    }
  }

  return hasRequiredEnvs
}
