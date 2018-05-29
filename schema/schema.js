const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './yaml.json')));
const ajv = new Ajv({allErrors: true});
const rawValidate = ajv.compile(schema);


function validate(json) {
  const valid = rawValidate(json);
  return {
    valid: valid,
    microsericeYaml: json,
    errors: rawValidate.errors,
    // errorsText: rawValidate.errorsText()
  };
}

module.exports = validate;
