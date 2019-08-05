export const isEmpty = obj => {
  return Object.keys(obj).length === 0
}

export const isEnvRequired = microservice => {
  if (microservice && microservice.environment) {
    const env = microservice.environment
    const requiredEnv = Object.values(env).find(entry => entry.required)
    if (requiredEnv) {
      // TODO: This breaks OMG UI expectations
      // return true
    }
  }
  return false
}

export const isRequiredEnvFilled = (microservice, filledEnv) => {
  if (microservice && microservice.environment) {
    const env = microservice.environment
    const requiredUnfilledEnv = Object.keys(env).find(key => env[key].required && filledEnv[key] == null)
    if (requiredUnfilledEnv) {
      // TODO: This breaks OMG UI expectations
      // return false
    }
  }
  return true
}
