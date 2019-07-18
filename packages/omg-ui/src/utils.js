export const isEmpty = obj => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

export const isEnvRequired = microservice => {
  if (microservice && microservice.environment) {
    const env = microservice.environment
    Object.keys(env).forEach(key => {
      if (env[key].required) {
        return true
      }
    })
  }
  return false
}

export const isRequiredEnvFilled = (microservice, cEnv) => {
  if (microservice && microservice.environment) {
    const mEnv = microservice.environment
    Object.keys(mEnv).forEach(key => {
      if (cEnv[key] === undefined || null) {
        return false
      }
    })
  }
  return true
}
