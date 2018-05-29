const fs = require('fs');
const Ajv = require('ajv');

const schema = JSON.parse(fs.readFileSync('./schema/yaml.json'));
const ajv = new Ajv({allErrors: true});
const rawValidate = ajv.compile(schema);


function validate(json) {
  const valid = rawValidate(json);
  process.stdout.write(JSON.stringify({
    valid: valid,
    microsericeYaml: json,
    errors: ajv.errors,
    errorsText: ajv.errorsText()
  }));
}

module.exports = validate;
