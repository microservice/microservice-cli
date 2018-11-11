const Ajv = require('ajv');
const microserviceSchema = require('./schemas/microservice');
const actionSchema = require('./schemas/action');
const eventSchema = require('./schemas/event');
const environmentVariableSchema = require('./schemas/environmentVariable');
const httpSchema = require('./schemas/http');
const formatSchema = require('./schemas/format');
const argumentSchema = require('./schemas/argument');
const volumeSchema = require('./schemas/volume');
const lifecycleSchema = require('./schemas/lifecycle');

const ajv = new Ajv({allErrors: true});

/**
 * Runs validation on a `microservice.yml`.
 *
 * @param {Object} json The given object to validate
 * @param {Object} validator The given validation function
 * @return {Object} Stringified Json of the results
 */
function validate(json, validator) {
  const valid = validator(json);
  if (valid) {
    return {
      valid,
      yaml: json,
      errors: validator.errors,
      text: ajv.errorsText(validator.errors),
    };
  }
  return {
    valid,
    issue: json,
    errors: validator.errors,
    text: ajv.errorsText(validator.errors),
  };
}

module.exports = {
  microservice: (o) => validate(o, ajv.compile(microserviceSchema)),
  action: (o) => validate(o, ajv.compile(actionSchema)),
  event: (o) => validate(o, ajv.compile(eventSchema)),
  environmentVariable: (o) => validate(o, ajv.compile(environmentVariableSchema)),
  http: (o) => validate(o, ajv.compile(httpSchema)),
  format: (o) => validate(o, ajv.compile(formatSchema)),
  argument: (o) => validate(o, ajv.compile(argumentSchema)),
  volume: (o) => validate(o, ajv.compile(volumeSchema)),
  lifecycle: (o) => validate(o, ajv.compile(lifecycleSchema)),
};
