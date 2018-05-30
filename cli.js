#!/usr/bin/env node

const program = require('commander');
const validate = require('./commands/validate');

program
  .version('0.0.1')
  .command('validate <path>')
  .action((path) => process.stdout.write(validate(path)));

program.parse(process.argv);
