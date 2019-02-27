#!/usr/bin/env node

import * as program from 'commander';
import * as utils from '../utils';
import * as fs from 'fs';
import * as path from 'path';
import Cli from './Cli';
const appender = require('../utils').appender;
const cli = new Cli();

program
  .description('For more details on the commands below, run `omg `(validate|build|run|subscribe|shutdown)` --help`')
  .version('0.7.4');

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
  .command('run <action>')
  .option('-i --image <i>', 'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`')
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', appender(), [])
  .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', appender(), [])
  .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
  .description('Run actions defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')
  .action(async (action, options) => {
    cli.buildMicroservice();
    await cli.run(action, options);
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

// needed because there is no default catch all command with commander.js
if ((process.argv.length < 3) || (!['validate', 'build', 'run', 'subscribe', 'shutdown', '--version'].includes(process.argv[2]))) {
  program.help();
}

let args = JSON.parse(JSON.stringify(process.argv));
let theArgs = args.splice(args.indexOf('run'));

if (theArgs.includes('run') && theArgs.includes('--help') && (theArgs[1] !== '--help')) {
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml')) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile')))) {
    utils.error('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  cli.buildMicroservice();
  try {
    cli.actionHelp(theArgs[1]);
  } catch (e) {
    utils.log(e);
    process.exit(1);
  }
}

args = JSON.parse(JSON.stringify(process.argv));
theArgs = args.splice(args.indexOf('subscribe'));
if (theArgs.includes('subscribe') && theArgs.includes('--help') && (theArgs[1] !== '--help')) {
  if ((!fs.existsSync(path.join(process.cwd(), 'microservice.yml')) || !fs.existsSync(path.join(process.cwd(), 'Dockerfile')))) {
    utils.error('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`');
    process.exit(1);
  }
  cli.buildMicroservice();
  try {
    cli.eventActionHelp(theArgs[1]);
  } catch (e) {
    utils.log(e);
    process.exit(1);
  }
}

process.on('SIGINT', async function() {
  try {
    await cli.controlC();
  } catch (e) {
    process.exit();
  }
});

module.exports = program;
