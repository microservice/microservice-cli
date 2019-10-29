// NOTE: This logger is important because it knows when a spinner is running
// and logs accordingly.

import util from 'util'
import pick from 'lodash/pick'
import logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'
import { CLIError } from '~/errors'
import { DEBUG_CLI, lifecycleDisposables } from './common'

let spinner: Ora | null = null

export type LogConsumer = (payload: { severity: 'info' | 'warn' | 'error'; contents: string }) => void
export const logConsumers: Set<LogConsumer> = new Set()

function serialize(message: string | Error) {
  if (typeof message === 'string') {
    return message
  }

  if (DEBUG_CLI) {
    return util.inspect(message, false, 5, false)
  }
  if (message instanceof CLIError) {
    let content = `${message.message}`
    const extraInfo = pick(message, Object.keys(message))
    // ^ Only pick enumerable keys
    if (Object.keys(extraInfo).length > 0) {
      content = `${content}\n  ${util.inspect(extraInfo, false, 5, false)}`
    }

    return content
  }

  return util.inspect(message, false, 5, false)
}

let spinnerAllowed = true

export function setSpinnerAllowed(status: boolean) {
  spinnerAllowed = status
}

let symbolsAllowed = true

export function setSymbolsAllowed(status: boolean) {
  symbolsAllowed = status
}

export function info(message: string) {
  let contents = message
  if (symbolsAllowed) {
    contents = `${logSymbols.info} ${contents}`
  }
  if (spinner) {
    spinner.stop()
  }
  console.log(contents)
  if (spinner) {
    spinner.start()
  }
  logConsumers.forEach(callback => callback({ severity: 'info', contents }))
}

export function warn(message: string) {
  let contents = message
  if (symbolsAllowed) {
    contents = `${logSymbols.warning} ${contents}`
  }
  if (spinner) {
    spinner.stop()
  }
  console.warn(contents)
  if (spinner) {
    spinner.start()
  }
  logConsumers.forEach(callback => callback({ severity: 'warn', contents }))
}

export function error(err: string | Error) {
  let contents = serialize(err)
  if (symbolsAllowed) {
    contents = `${logSymbols.error} ${contents}`
  }
  if (spinner) {
    spinner.stop()
  }
  console.error(contents)
  if (spinner) {
    spinner.start()
  }
  logConsumers.forEach(callback => callback({ severity: 'error', contents }))
}

export function fatal(message: string): never {
  if (spinner) {
    spinner.stop()
  }
  console.error(message)
  try {
    lifecycleDisposables.dispose()
  } catch (err) {
    if (DEBUG_CLI) {
      console.error(err && err.stack)
    }
  }

  process.exit(1)
  throw new CLIError('Never should reach here.')
}

export function spinnerStart(message: string) {
  if (spinner) {
    const err = new Error('Cannot start new spinner when one is already running')
    // @ts-ignore: Useful debug vars
    err._oldSpinnerMessage = spinner.message
    // @ts-ignore: Useful debug vars
    err._newSpinnerMessage = message
    throw err
  }
  if (spinnerAllowed) {
    spinner = ora(message).start()
  }
  return spinner
}

export function spinnerStop() {
  if (spinner) {
    spinner.stop()
    spinner = null
  }
}

export function spinnerSucceed(message?: string) {
  if (spinner) {
    spinner.succeed(message)
    spinner = null
  }
}

export function spinnerFail(message?: string) {
  if (spinner) {
    spinner.fail(message)
    spinner = null
  }
}
