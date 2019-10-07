import { CompositeDisposable, Disposable } from 'event-kit'

export const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMS_CLI_DEBUG')
export const lifecycleDisposables = new CompositeDisposable()

export function disposableInterval(callback: () => void, timeout: number): Disposable {
  const intervalId = setInterval(callback, timeout)

  return new Disposable(() => {
    clearInterval(intervalId)
  })
}

let options: Record<string, any> = {}

export function setCliOptions(newOptions: Record<string, any>) {
  options = newOptions
}

export function getCliOptions(): Record<string, any> {
  return options
}

export const HELP_OMG_LIST = `Try 'omg list' to get a list of available actions`
export const HELP_OMG_LIST_DETAILS = `Try 'omg list --details' to get a detailed list of available actions`
