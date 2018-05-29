#!/usr/bin/env node

const fs = require('fs');
const YAML = require('yamljs');
const program = require('commander');
const validate = require('./schema/schema');

program
  .version('0.0.1')
  .command('validate <path>').action((path) => {
    process.stdout.write(JSON.stringify(validate(YAML.parse(fs.readFileSync(path).toString())), null, 2));
  });


program.parse(process.argv);
