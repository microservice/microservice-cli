#!/usr/bin/env node

const program = require('commander');
const validate = require('./commands/validate');
const _exec = require('./commands/exec');


program
  .version('0.0.1');

program
  .command('validate <path>')
  .description('Use to validate a microservice.yml')
  .action((path) => process.stdout.write(validate(path)));

program
  .command('exec <command> [args...]') // TODO how to get the rest of the args
  .description('TODO') // TODO
  .action((command, args) => {
    console.log(_exec(command, args));
    // console.log(`command: ${command} with args: ${args}`)
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
