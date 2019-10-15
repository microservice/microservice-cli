#!/usr/bin/env node

import program from 'commander'
import fs from 'fs'
import path from 'path'
import * as utils from '../utils'
import Cli from './Cli'

let updateAvailable = false
const cli = new Cli()

utils.checkVersion().then(updateAvailableResponse => {
  updateAvailable = updateAvailableResponse
})

program
  .description('For more details on the commands below, run `oms `(validate|build|run|subscribe|shutdown)` --help`')
  .version(require('../../package.json').version)

program
  .command('validate')
  .option('-j --json', 'Formats output to JSON')
  .option('-s --silent', 'Only feedback is the status exit code')
  .description('Validate the structure of a `oms.yml` in the current directory')
  .action(options => Cli.validate(options))

program
  .command('build')
  .option('-t --tag, <t>', 'The tag name of the image')
  .description(
    'Builds the microservice defined by the `Dockerfile`. Image will be tagged with `oms/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a random string will be used',
  )
  .action(async options => Cli.build(options))

program
  .command('run <action>')
  .option(
    '-i --image <i>',
    'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`',
  )
  .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', utils.appender(), [])
  .option(
    '-e --envs <e>',
    'Environment variables to be passed to run environment, must be of the form `key="val"`',
    utils.appender(),
    [],
  )
  .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
  .description('Run actions defined in your `oms.yml`. Must be ran in a directory with a `Dockerfile` and a `oms.yml`')
  .action(async (action, options) => {
    cli.buildMicroservice()
    await cli.run(action, options)
  })

program
  .command('subscribe <action> <event>')
  .option('-a --args <a>', 'Arguments to be passed to the event, must be of the form `key="val"`', utils.appender(), [])
  .option(
    '-e --envs <e>',
    'Environment variables to be passed to run environment, must be of the form `key="val"`',
    utils.appender(),
    [],
  )
  .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
  .description(
    'Subscribe to an event defined in your `oms.yml`. Must be ran in a directory with a `Dockerfile` and a `oms.yml`',
  )
  .action(async (action, event, options) => {
    cli.buildMicroservice()
    await cli.subscribe(action, event, options)
  })

program
  .command('ui')
  .option('-p --port, <p>', 'The port to bind')
  .option('--no-open', 'Do not open in browser')
  .option('--inherit-env', 'Binds host env variable asked in the oms.yml to the container env')
  .description('Starts to oms-app which monitors your microservice.')
  .action(async options => cli.ui(options))

program
  .command('list')
  .option('-j --json', 'Returns actions in json format')
  .option('-d --details', 'Returns detailed actions')
  .description('Lists all actions available in microservice.')
  .action(options => cli.list(options))

// needed because there is no default catch all command with commander.js
if (
  process.argv.length < 3 ||
  !['validate', 'build', 'run', 'subscribe', 'ui', 'list', '--version', '-V'].includes(process.argv[2])
) {
  program.help()
}

const args = JSON.parse(JSON.stringify(process.argv))

function checkAndBuild(arg: string) {
  const theArgs = args.splice(args.indexOf(arg))
  if ((theArgs.includes('run') || theArgs.includes(arg)) && theArgs.includes('--help') && theArgs[1] !== '--help') {
    if (utils.checkValidOMSDirectory(process.cwd())) {
      utils.error('Must be ran in a directory with a `Dockerfile` and a `oms.y[a]ml`')
      process.exit(1)
    }
    cli.buildMicroservice()
    try {
      cli.actionHelp(theArgs[1])
    } catch (e) {
      utils.log(e)
      process.exit(1)
    }
  }
}

checkAndBuild('run')
checkAndBuild('subscribe')

process.on('SIGINT', async () => {
  try {
    await cli.controlC()
  } catch (e) {
    process.exit()
  }
})

process.on('exit', () => {
  if (updateAvailable) {
    utils.showVersionCard()
  }
})

module.exports = program
