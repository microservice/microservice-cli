const fs = require('fs');
const YAML = require('yamljs');
const schemaValidator = require('../schema/schema');

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
