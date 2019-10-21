#!/usr/bin/env node

const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMS_CLI_DEBUG')

// Wrapping whole thing in promise to catch any errors in require-ing as well
const mainPromise = new Promise(resolve => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const mainModule = require('./index')
  resolve(mainModule.default())
})

mainPromise.catch(error => {
  if (DEBUG_CLI) {
    console.error(error && error.stack)
  } else {
    console.error(error)
  }
  process.exit(1)
})

function spinnerStop() {
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    require('./logger').spinnerStop()
  } catch (_) {
    /* No Op */
  }
}
function disposeDisposables() {
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { lifecycleDisposables } = require('./common')
    lifecycleDisposables.dispose()
    // ^ Disposing all "handles" should exit server by itself
  } catch (_) {
    /* No Op */
  }
}

// If CTRL-C was called before or not.
let triedToDispose = false
process.on('SIGINT', () => {
  if (triedToDispose) {
    // We seem to have a bug, previous exit attempt failed.
    process.exit(1)
  }
  triedToDispose = true

  spinnerStop()
  disposeDisposables()
})
process.on('SIGHUP', disposeDisposables)
process.on('exit', disposeDisposables)
