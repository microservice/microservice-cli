#!/usr/bin/env node

const program = require('commander');
const helper = require('./helper');
const appender = require('../utils').appender;

program
  .version('0.0.1');

program
  .command('validate')
  .description('Validate the structure of a `microservice.yml` in the current directory')
  .usage(' ')
  .action(() => helper.validate());

program
  .command('build <name>')
  .description('Builds the microservice defined by the `Dockerfile` and `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .usage(' ')
  .action(async (name) => await helper.build(name));

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
  await helper.controlC();
});

module.exports = program;
