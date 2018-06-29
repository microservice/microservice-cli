const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({allErrors: true});
const microserviceSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/microservice.json')));
const commandSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/command.json')));
const environmentVariableSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/environmentVariable.json')));
const httpSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/http.json')));
const argumentSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/argument.json')));
const volumeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/volume.json')));
const lifecycleSchema = JSON.parse(fs.readFileSync(path.join(__dirname, './schemas/lifecycle.json')));

/**
 * Runs validation on a `microservice.yml`.
 *
 * @param {Object} object The given object to validate
 * @param {Object} validator The given validation function
 * @return {Object} Stringified Json of the results
 */
function validate(object, validator) {
  const json = object;
  const valid = validator(json);

  return {
    valid,
    yaml: json,
    errors: validator.errors,
  };
}

module.exports = {
  microservice: (o) => validate(o, ajv.compile(microserviceSchema)),
  command: (o) => validate(o, ajv.compile(commandSchema)),
  environmentVariable: (o) => validate(o, ajv.compile(environmentVariableSchema)),
  http: (o) => validate(o, ajv.compile(httpSchema)),
  argument: (o) => validate(o, ajv.compile(argumentSchema)),
  volume: (o) => validate(o, ajv.compile(volumeSchema)),
  lifecycle: (o) => validate(o, ajv.compile(lifecycleSchema)),
};
