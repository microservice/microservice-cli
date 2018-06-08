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

function appender(xs) {
  xs = xs || [];
  return function (x) {
    xs.push(x);
    return xs;
  }
}

program
  .command('exec <command> [args...]') // TODO how to get the rest of the args
  .option('-e --environment <env>', '', appender(), [])
  .description('TODO') // TODO
  .action(async (command, args, env) => {
    const data = await _exec(command, args, env.environment);
    console.log(data);
  });

program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
