const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const YAML = require('yamljs');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './yaml.json')));
const ajv = new Ajv({allErrors: true});
const schemaValidator = ajv.compile(schema);

/**
 * Runs validation on a `microservice.yml`.
 *
 * @return {Object} Stringified Json of the results
 */
function validate() {
  try {
    const json = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString());
    const valid = schemaValidator(json);

    return {
      valid,
      microsericeYaml: json,
      errors: schemaValidator.errors,
    };
  } catch (e) {
    return {
      error: 'Unable to parse file',
      info: e,
    };
  }
}

module.exports = validate;
