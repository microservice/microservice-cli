#!/usr/bin/env node

const fs = require('fs');
const Ajv = require('ajv');
const YAML = require('yamljs');
const program = require('commander');

const schema = JSON.parse(fs.readFileSync('./schema/yaml.json'));
const ajv = new Ajv({allErrors: true});
const validate = ajv.compile(schema);

program
  .version('0.0.1')
  .command('validate <path>').action((path) => {
    const yaml = YAML.parse(fs.readFileSync(path).toString());
    const valid = validate(yaml);
    console.log({
      valid: valid,
      yaml: JSON.stringify(yaml),
      errors: ajv.errors,
      errorsText: ajv.errorsText()
    });
});

program.parse(process.argv);
