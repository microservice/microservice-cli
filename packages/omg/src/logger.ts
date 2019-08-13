// NOTE: This logger is important because it knows when a spinner is running
// and logs accordingly.

import { DEBUG_CLI, lifecycleDisposables } from './common'

export function info(...payload: any) {
  console.log(...payload)
}

export function warn(...payload: any) {
  console.warn(...payload)
}

export function error(...payload: any) {
  console.error(...payload)
}

export function fatal(message: string) {
  console.error(message)
  try {
    lifecycleDisposables.dispose()
  } catch (err) {
    if (DEBUG_CLI) {
      console.error(err && err.stack)
    }
  }

  process.exit(1)
}
