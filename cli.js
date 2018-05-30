#!/usr/bin/env node

const program = require('commander');
const validate = require('./commands/validate');

program
  .version('0.0.1')
  .command('validate <path>')
  .description('Use to validate a microservice.yml')
  .action((path) => process.stdout.write(validate(path)));

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
