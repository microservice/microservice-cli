// NOTE: This logger is important because it knows when a spinner is running
// and logs accordingly.

import util from 'util'
import logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'
import { DEBUG_CLI, lifecycleDisposables } from './common'

let spinner: Ora | null = null

export function info(message: string) {
  let contents = `${logSymbols.info} ${message}`
  if (spinner) {
    contents = `\r${contents}`
  }
  console.log(contents)
}

export function warn(message: string) {
  let contents = `${logSymbols.warning} ${message}`
  if (spinner) {
    contents = `\r${contents}`
  }
  console.warn(contents)
}

export function error(err: string | Error) {
  const itemToLog = DEBUG_CLI ? util.inspect(err, false, 5, false) : err
  let contents = `${logSymbols.error} ${itemToLog instanceof Error ? itemToLog.message : itemToLog.toString()}`
  if (spinner) {
    contents = `\r${contents}`
  }
  console.error(contents)
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
  throw new Error('Never should reach here.')
}

let spinnerAllowed = true

export function setSpinnerAllowed(status: boolean) {
  spinnerAllowed = status
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
