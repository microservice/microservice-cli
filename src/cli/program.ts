#!/usr/bin/env node

import * as program from 'commander';
import Cli from './Cli';
const appender = require('../utils').appender;
const cli = new Cli();


program
  .description('For more details on the commands below, run `omg `(validate|build|exec|subscribe|shutdown)` --help`')
  .version('0.2.5');

program
  .command('validate')
  .option('-j --json', 'Formats output to JSON')
  .option('-s --silent', 'Only feedback is the status exit code')
  .description('Validate the structure of a `microservice.yml` in the current directory')
  .action((options) => Cli.validate(options));

program
  .command('build')
  .option('-t --tag, <t>', 'The tag name of the image')
  .description('Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a random string will be used')
  .action(async (options) => await Cli.build(options));

program
  .command('exec <action>')
  .option('-i --image <i>', 'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender(), [])
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender(), [])
  .description('Run actions defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (action, options) => {
    cli.buildMicroservice();
    await cli.exec(action, options);
  });

program
  .command('subscribe <action> <event>')
  .option('-a --args <a>', 'Arguments to be passed to the event, must be of the form `key="val"`', appender(), [])
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender(), [])
  .description('Subscribe to an event defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (action, event, options) => {
    cli.buildMicroservice();
    await cli.subscribe(action, event, options);
  });

program
  .command('shutdown')
  .description('Shutdown a microservice process that was started by an event command')
  .action(async () => await Cli.shutdown());

// needed because there is no default catch all command with commander.js
if ((process.argv.length < 3) || (!['validate', 'build', 'exec', 'subscribe', 'shutdown', '--version'].includes(process.argv[2]))) {
  program.help();
}

process.on('SIGINT', async function() {
  try {
    await cli.controlC();
  } catch (e) {
    process.exit();
  }
});

module.exports = program;
