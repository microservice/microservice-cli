#!/usr/bin/env node

const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMG_CLI_DEBUG') || process.argv.includes('--debug')

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

// If CTRL-C was called before or not.
let triedToDispose = false
process.on('SIGINT', () => {
  if (triedToDispose) {
    // We seem to have a bug, previous exit attempt failed.
    process.exit(1)
  }
  triedToDispose = true

  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { lifecycleDisposables } = require('./common')
  lifecycleDisposables.dispose()
  // ^ Disposing all "handles" should exit server by itself
})
process.on('SIGHUP', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { lifecycleDisposables } = require('./common')
  lifecycleDisposables.dispose()
  // ^ Garbage collect sync stuff before process exit
})
