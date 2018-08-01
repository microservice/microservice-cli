#!/usr/bin/env node

const program = require('commander');
const helper = require('./helper');
const appender = require('../utils').appender;

program
  .version('0.0.1');

program
  .command('validate')
  .usage(' ')
  .option('-j --json', 'Formats output to JSON')
  .option('-s --silent', 'Only feedback is the status code that is exited with')
  .description('Validate the structure of a `microservice.yml` in the current directory')
  .action((options) => helper.validate(options));

program
  .command('build')
  .description('Builds the microservice defined by the `Dockerfile` and `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .usage(' ')
  .action(async () => await helper.build());

program
  .command('exec <image>')
  .usage(' ')
  .option('-c --cmd <c>', 'The command you want to run, if not provided the `entrypoint` command will be ran')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender(), [])
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender(), [])
  .description('Run commands defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (image, options) => await helper.exec(image, options));

if (process.argv.length === 2) {
  program.help();
}
process.on('SIGINT', async function() {
  try {
    await helper.controlC();
  } catch (e) {
    process.exit();
  }
});

module.exports = program;
