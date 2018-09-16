const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({allErrors: true});
const microserviceSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/microservice.json')));
const actionSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/action.json')));
const environmentVariableSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/environmentVariable.json')));
const httpSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/http.json')));
const formatSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/format.json')));
const argumentSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/argument.json')));
const volumeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/volume.json')));
const lifecycleSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/lifecycle.json')));

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
  environmentVariable: (o) => validate(o, ajv.compile(environmentVariableSchema)),
  http: (o) => validate(o, ajv.compile(httpSchema)),
  format: (o) => validate(o, ajv.compile(formatSchema)),
  argument: (o) => validate(o, ajv.compile(argumentSchema)),
  volume: (o) => validate(o, ajv.compile(volumeSchema)),
  lifecycle: (o) => validate(o, ajv.compile(lifecycleSchema)),
};
