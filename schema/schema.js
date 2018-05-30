const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './yaml.json')));
const ajv = new Ajv({allErrors: true});
const schemaValidator = ajv.compile(schema);

module.exports = schemaValidator;
