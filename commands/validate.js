const fs = require('fs');
const YAML = require('yamljs');
const schemaValidator = require('../schema/schema');

/**
 * Returns a JSON string with results of running the .yml file through the
 * schema validator.
 *
 * @param {string} path The given path
 * @return {string} The stringified JSON result
 */
function validate(path) {
  const json = YAML.parse(fs.readFileSync(path).toString());
  const valid = schemaValidator(json);

  return JSON.stringify({
    valid,
    microsericeYaml: json,
    errors: schemaValidator.errors,
  }, null, 2);
}

module.exports = validate;
