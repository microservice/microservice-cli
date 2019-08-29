import { CompositeDisposable } from 'event-kit'

export const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMG_CLI_DEBUG') || process.argv.includes('--debug')
export const lifecycleDisposables = new CompositeDisposable()
