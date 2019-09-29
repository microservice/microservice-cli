import argsToMap from '~/helpers/argsToMap'
import { ConfigSchema, Args } from '~/types'

interface ProcessContainerEnvOptions {
  envs: Args
  config: ConfigSchema
  inheritEnv: boolean
}

interface ProcessContainerEnvResult {
  missing: string[]
  values: Record<string, any>
}

export default function processContainerEnv({
  envs,
  config,
  inheritEnv,
}: ProcessContainerEnvOptions): ProcessContainerEnvResult {
  const missing: string[] = []
  const values = {}

  const envsMap = argsToMap(envs)

  Object.entries(config.environment || {}).forEach(([envName, env]) => {
    let value = envsMap[envName]
    if (inheritEnv && process.env[envName]) {
      value = process.env[envName]
    }

    if (value) {
      values[envName] = value
    } else {
      if (env.required) {
        missing.push(envName)
      } else if (env.default) {
        values[envName] = value
      }
    }
  })

  return { missing, values }
}
