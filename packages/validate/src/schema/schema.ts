import Ajv from 'ajv'

import microserviceSchema from './schemas/microservice'
import actionSchema from './schemas/action'
import eventSchema from './schemas/event'
import environmentVariableSchema from './schemas/environmentVariable'
import httpSchema from './schemas/http'
import formatSchema from './schemas/format'
import argumentSchema from './schemas/argument'
import volumeSchema from './schemas/volume'
import lifecycleSchema from './schemas/lifecycle'
import forwardSchema from './schemas/forward'
import healthSchema from './schemas/health'

const ajv = new Ajv({ allErrors: true })

/**
 * Runs validation on a `oms.yml`.
 *
 * @param {Object} json The given object to validate
 * @param {Object} validator The given validation function
 * @return {Object} Stringified Json of the results
 */
function validate(json: any, validator: any): any {
  const valid = validator(json)
  if (valid) {
    return {
      valid,
      yaml: json,
      errors: validator.errors,
      text: ajv.errorsText(validator.errors),
    }
  }
  return {
    valid,
    issue: json,
    errors: validator.errors,
    text: ajv.errorsText(validator.errors),
  }
}

module.exports = {
  microservice: (o: any) => validate(o, ajv.compile(microserviceSchema)),
  action: (o: any) => validate(o, ajv.compile(actionSchema)),
  event: (o: any) => validate(o, ajv.compile(eventSchema)),
  environmentVariable: (o: any) => validate(o, ajv.compile(environmentVariableSchema)),
  http: (o: any) => validate(o, ajv.compile(httpSchema)),
  format: (o: any) => validate(o, ajv.compile(formatSchema)),
  argument: (o: any) => validate(o, ajv.compile(argumentSchema)),
  volume: (o: any) => validate(o, ajv.compile(volumeSchema)),
  lifecycle: (o: any) => validate(o, ajv.compile(lifecycleSchema)),
  forward: (o: any) => validate(o, ajv.compile(forwardSchema)),
  health: (o: any) => validate(o, ajv.compile(healthSchema)),
}
