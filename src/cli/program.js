#!/usr/bin/env node

const program = require('commander');
const Cli = require('./Cli');
const appender = require('../utils').appender;
const cli = new Cli();

program
  .version('0.0.1');

program
  .command('validate')
  .usage(' ')
  .option('-j --json', 'Formats output to JSON')
  .option('-s --silent', 'Only feedback is the status exit code')
  .description('Validate the structure of a `microservice.yml` in the current directory')
  .action((options) => Cli.validate(options));

program
  .command('build')
  .usage(' ')
  .option('-t --tag, <t>', 'The tag name of the image')
  .description('Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a tag name must be provided. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (options) => Cli.build(options));

program
  .command('exec <command>')
  .usage(' ')
  .option('-i --image <i>', 'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender(), [])
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender(), [])
  .description('Run actions defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (command, options) => {
    cli.buildMicroservice();
    await cli.exec(command, options);
  });

program
  .command('subscribe <event>')
  .usage(' ')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender(), [])
  .description('Subscribe to an event defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (event, options) => {
    cli.buildMicroservice();
    await cli.subscribe(event, options);
  });

program
  .command('shutdown')
  .usage(' ')
  .description('Shutdown a microservice process that was started by an event command')
  .action(async () => await Cli.shutdown());

if (process.argv.length === 2) {
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
