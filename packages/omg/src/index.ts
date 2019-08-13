import program from 'commander'

import manifest from '../package.json'
import * as actions from './actions'
import * as logger from './logger'

export default async function main() {
  let actionPromise

  program
    .version(manifest.version)
    .description('For more details on the commands below, run `omg `(validate|build|run|subscribe|shutdown)` --help`')
    .option('-v --version', 'Show OMG CLI version')

  program
    .command('validate')
    .option('-j --json', 'Formats output to JSON')
    .option('-s --silent', 'Only feedback is the status exit code')
    .description('Validate the structure of a `microservice.yml` in the current directory')
    .action(options => {
      actionPromise = actions.validate({
        options,
        parameters: [],
      })
    })

  program
    .command('build')
    .option('-t --tag, <t>', 'The tag name of the image')
    .description(
      'Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a random string will be used',
    )
    .action(options => {
      actionPromise = actions.build({
        options,
        parameters: [],
      })
    })

  program
    .command('run <action>')
    .option(
      '-i --image <i>',
      'The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`',
    )
    .option('-a --args <a>', 'Arguments to be passed to the command, must be of the form `key="val"`', [])
    .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', [])
    .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
    .description(
      'Run actions defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`',
    )
    .action(async (action, options) => {
      actionPromise = actions.run({
        options,
        parameters: [action],
      })
    })

  program
    .command('subscribe <action> <event>')
    .option('-a --args <a>', 'Arguments to be passed to the event, must be of the form `key="val"`', [])
    .option('-e --envs <e>', 'Environment variables to be passed to run environment, must be of the form `key="val"`', [])
    .option('-r --raw', 'All logging is suppressed expect for the output of the action.')
    .description(
      'Subscribe to an event defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`',
    )
    .action(async (action, event, options) => {
      actionPromise = actions.subscribe({
        options,
        parameters: [action, event],
      })
    })

  program
    .command('ui')
    .option('-p --port, <p>', 'The port to bind')
    .option('--no-open', 'Do not open in browser')
    .option('--inherit-env', 'Binds host env variable asked in the microservice.yml to the container env')
    .description('Starts to omg-app which monitors your microservice.')
    .action(options => {
      actionPromise = actions.ui({
        options,
        parameters: [],
      })
    })

  program
    .command('list')
    .option('-j --json', 'Returns actions in json format')
    .option('-d --details', 'Returns detailed actions')
    .description('Lists all actions available in microservice.')
    .action(options => {
      actionPromise = actions.list({
        options,
        parameters: [],
      })
    })

  // Handle invalid commands
  program.command('*').action(() => {
    program.help()
    process.exit(1)
  })

  // The order is important, this has to be before the args length check.
  program.parse(process.argv)

  if (program.v) {
    logger.info(program.version)
    process.exit(0)
  }

  if (program.args.length < 1) {
    program.help()
    process.exit(1)
  }

  await actionPromise
}
