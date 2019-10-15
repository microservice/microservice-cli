import { EnvironmentVariable } from 'oms-validate'

/**
 * Matches the case of given cli environment arguments to the case defined in
 * the microservice.yml.
 *
 * @param {Object} env The given environment variable mapping
 * @param {Array<EnvironmentVariable>} environmentVariables The given {@link EnvironmentVariable}s
 * @return {Object} The environment mapping with correct cases
 */
export default function matchEnvironmentCases(env: any, environmentVariables: EnvironmentVariable[]): any {
  const result = {}
  Object.keys(env).forEach(key => {
    environmentVariables.forEach(cap => {
      if (cap.name.toLowerCase() === key.toLowerCase()) {
        result[cap.name] = env[key]
      }
    })
  })
  return result
}
