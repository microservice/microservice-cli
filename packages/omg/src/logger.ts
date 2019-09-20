// NOTE: This logger is important because it knows when a spinner is running
// and logs accordingly.

import util from 'util'
import logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'
import { DEBUG_CLI, lifecycleDisposables } from './common'

let spinner: Ora | null = null

export type LogConsumer = (payload: { severity: 'info' | 'warn' | 'error'; contents: string }) => void
export const logConsumers: Set<LogConsumer> = new Set()

let spinnerAllowed = true

export function setSpinnerAllowed(status: boolean) {
  spinnerAllowed = status
}

export function info(message: string) {
  const contents = `${logSymbols.info} ${message}`
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
  const contents = `${logSymbols.warning} ${message}`
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
  const itemToLog = DEBUG_CLI ? util.inspect(err, false, 5, false) : err
  const contents = `${logSymbols.error} ${itemToLog instanceof Error ? itemToLog.message : itemToLog.toString()}`
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
  throw new Error('Never should reach here.')
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
