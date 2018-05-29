const fs = require('fs');
const Ajv = require('ajv');

const schema = JSON.parse(fs.readFileSync('./schema/yaml.json'));
const ajv = new Ajv({allErrors: true});
const rawValidate = ajv.compile(schema);


function validate(json) {
  const valid = rawValidate(json);
  console.log({
    valid: valid,
    microsericeYaml: JSON.stringify(json),
    errors: ajv.errors,
    errorsText: ajv.errorsText()
  });
}

module.exports = validate;
