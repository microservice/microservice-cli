import program from 'commander'

import manifest from '../package.json'
import * as commands from './commands'
import * as logger from './logger'
import { Args } from '~/types'
import { setCliOptions } from './common'
import { CLIError } from '~/errors'

function getCollector(name: string) {
  return (val: string, memo: Args) => {
    const eqIdx = val.indexOf('=')
    if (eqIdx === -1) {
      logger.fatal(`Invalid value for \`${name}'s\` expected format of key=val: ${val}`)
    }
    const key = val.slice(0, eqIdx)
    const value = val.slice(eqIdx + 1)
    memo.push([key, value])
    return memo
  }
}

export default async function main() {
  let actionPromise

  program
    .version(manifest.version, '-v --version', 'Show version information and exit.')
    .description('For more details on the commands below, run `oms `(build|list|run|subscribe|validate|ui)` --help`.')
    .option('-d, --directory', 'Directory to use as root.')

  program
    .command('validate')
    .option('-j, --json', 'Displays output as JSON.')
    .option('-s, --silent', 'Limits the status exit code.')
    .description('Validate the structure of `oms.yml` in the working directory.')
    .action(options => {
      setCliOptions(options)
      if (options.json) {
        logger.setSymbolsAllowed(false)
      }
      actionPromise = commands.validate({
        options,
        parameters: [],
      })
    })

  program
    .command('build')
    .option('-t, --tag, <t>', 'The tag name of the image.')
    .option('-r, --verbose', 'Display Docker build logs.')
    .description(
      `
      Builds the microservice defined in the \`Dockerfile\`. 
      
      If the \`-t --tag\` is not provided, the image will be tagged with \`oms/$github_user/$repo_name\`. If no git config is present a random string will be used.
      `,
    )
    .action(options => {
      setCliOptions(options)
      if (options.verbose) {
        logger.setSpinnerAllowed(false)
      }
      actionPromise = commands.build({
        options,
        parameters: [],
      })
    })

  program
    .command('run <action>')
    .option(
      '-i, --image <i>',
      'The name of the image to spin up the microservice, if not provided a fresh image will be built based off the `Dockerfile`.',
    )
    .option(
      '-a, --args <a>',
      'Arguments to be passed to the action, must be in the form `key = "value"`. These arguments may be JSON-encoded for `map`, `list` and `object` types.',
      getCollector('args'),
      [],
    )
    .option(
      '-e, --envs <e>',
      'Environment variables to be passed to run environment. Must be in the form `key = "value"`.',
      getCollector('envs'),
      [],
    )
    .option('--inherit-env', 'Binds host env variable asked in the oms.yml to the container environment.')
    .option('-r, --verbose', 'Display Docker build logs.')
    .option('--silent', 'Hide output except for action result.')
    .option('--debug', 'Display container logs in CLI (for debugging purpose).')
    .description('Run actions defined in your `oms.yml`.')
    .action(async (action, options) => {
      setCliOptions(options)
      if (options.silent || options.verbose) {
        logger.setSpinnerAllowed(false)
      }
      if (options.silent) {
        logger.setSymbolsAllowed(false)
      }
      actionPromise = commands.run({
        options,
        parameters: [action],
      })
    })

  program
    .command('subscribe <action> <event>')
    .option(
      '-i, --image <i>',
      'The name of the image to spin up the microservice. If not provided a fresh image will be built based off the `Dockerfile`.',
    )
    .option(
      '-a, --args <a>',
      'Arguments to be passed to the event, must be of the form `key = "value"`. These arguments may be JSON encoded for `map`, `list` and `object` types.',
      getCollector('args'),
      [],
    )
    .option(
      '-e, --envs <e>',
      'Environment variables to be passed to run environment, must be in the form `key = "value"`',
      getCollector('envs'),
      [],
    )
    .option('--inherit-env', 'Binds host env variable specified in the `oms.yml` to the container environment')
    .option('-r, --verbose', 'Show docker build logs')
    .option('--silent', 'Hide output except for action result')
    .option('--debug', 'Show container logs in CLI (for debugging purpose)')
    .description('Subscribe to an event defined in your `oms.yml`')
    .action(async (action, event, options) => {
      setCliOptions(options)
      if (options.silent || options.verbose) {
        logger.setSpinnerAllowed(false)
      }
      if (options.silent) {
        logger.setSymbolsAllowed(false)
      }
      actionPromise = commands.subscribe({
        options,
        parameters: [action, event],
      })
    })

  program
    .command('ui')
    .option(
      '-i, --image <i>',
      'The name of the image to spin up the microservice. If not provided a fresh image will be built using the `Dockerfile`',
    )
    .option('-p, --port, <p>', 'The port to bind')
    .option('--no-open', 'Do not open in browser')
    .option(
      '--experimental',
      "The OMS UI is still a WIP. Specify this option to acknowledge you understand it's experimental and it's behavior is subject to change",
    )
    .option('--inherit-env', 'Binds host env variable asked in the `oms.yml` to the container env')
    .description('Starts the OMS UI which monitors your microservice.')
    .action(options => {
      if (!options.experimental) {
        actionPromise = new Promise((resolve, reject) => {
          reject(new CLIError('OMS UI is still experimental. Please re-run the command with `--experimental` to use it'))
        })
        return
      }

      setCliOptions(options)
      actionPromise = commands.ui({
        options,
        parameters: [],
      })
    })

  program
    .command('list')
    .option('-j, --json', 'Display actions as JSON.')
    .option('--pretty', 'Works with `-j, --json` to display prettified JSON.')
    .option('-d, --details', 'Returns detailed actions.')
    .description('Lists all actions available in microservice.')
    .action(options => {
      setCliOptions(options)
      if (options.json) {
        logger.setSymbolsAllowed(false)
      }
      actionPromise = commands.list({
        options,
        parameters: [],
      })
    })

  program.on('--help', () => {
    console.log('')
    console.log('Environment Variables recognized by the CLI:')
    console.log('  OMS_CLI_DEBUG=true\t\t\tTo print stack traces of errors/issues')
  })

  // The order is important, this has to be before the args length check.
  program.parse(process.argv)

  if (!actionPromise) {
    program.help()
    process.exit(1)
  }

  await actionPromise.catch(error => {
    logger.spinnerStop()
    logger.error(error)
  })
}
