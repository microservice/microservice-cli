import argsToMap from '~/helpers/argsToMap'
import { ConfigSchema, Args } from '~/types'

interface ProcessContainerEnvOptions {
  envs: Args
  config: ConfigSchema
  inheritEnv: boolean
}

interface ProcessContainerEnvResult {
  missing: string[]
  invalid: string[]
  values: Record<string, any>
}

export default function processContainerEnv({
  envs,
  config,
  inheritEnv,
}: ProcessContainerEnvOptions): ProcessContainerEnvResult {
  const missing: string[] = []
  const invalid: string[] = []
  const values = {}

  const envsMap = argsToMap(envs)

  Object.entries(config.environment || {}).forEach(([envName, env]) => {
    let value = envsMap[envName]
    if (inheritEnv && process.env[envName]) {
      value = process.env[envName]
    }

    if (typeof value === 'string') {
      values[envName] = value
    } else {
      if (env.required) {
        missing.push(envName)
      } else if (env.default) {
        values[envName] = value
      }
    }
  })

  Object.entries(config.environment || {}).forEach(([envName, env]) => {
    const value = values[envName]

    if (typeof value !== 'string' || !env.type) {
      // Non-existent, ignore
      return
    }
    if (env.type === 'boolean' && !['false', 'true'].includes(value)) {
      invalid.push(envName)
    }
    if (env.type === 'int' && parseInt(value, 10).toString() !== value) {
      invalid.push(envName)
    }
    if (env.type === 'float' && parseFloat(value).toString() !== value) {
      invalid.push(envName)
    }
  })

  return { missing, invalid, values }
}
