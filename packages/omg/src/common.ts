import { CompositeDisposable, Disposable } from 'event-kit'

export const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMG_CLI_DEBUG') || process.argv.includes('--debug')
export const lifecycleDisposables = new CompositeDisposable()

export function disposableInterval(callback: () => void, timeout: number): Disposable {
  const intervalId = setInterval(callback, timeout)

  return new Disposable(() => {
    clearInterval(intervalId)
  })
}
