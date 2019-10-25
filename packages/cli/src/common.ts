import { CompositeDisposable, Disposable } from 'event-kit'

export const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMS_CLI_DEBUG')
export const lifecycleDisposables = new CompositeDisposable()

export function disposableInterval (callback: () => void, timeout: number): Disposable {
  const intervalId = setInterval(callback, timeout)

  return new Disposable(() => {
    clearInterval(intervalId)
  })
}

let options: Record<string, any> = {}

export function setCliOptions (newOptions: Record<string, any>) {
  options = newOptions
}

export function getCliOptions (): Record<string, any> {
  return options
}

export const HELP_OMS_LIST = `Try 'oms list' to get a list of available actions`
export const HELP_OMS_LIST_DETAILS = `Try 'oms list --details' to get a detailed list of available actions`
export const HELP_OMS_SPEC_WEBSITE = 'https://openmicroservices.org/schema/info/'
export const HELP_OMS_GETTING_STARTED_WEBSITE = 'https://openmicroservices.org/introduction/overview/'
