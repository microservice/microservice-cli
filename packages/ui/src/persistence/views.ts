import { get, set } from 'idb-keyval'

import { store } from './common'

const KEY_SHOW_LOGS = 'KEY_SHOW_LOGS'
const KEY_SHOW_HISTORY = 'VIEWS_SHOW_HISTORY'
const DEFAULT_SHOW_LOGS = true
const DEFAULT_SHOW_HISTORY = true

export async function getShowHistory(): Promise<boolean> {
  const value = await get<boolean>(KEY_SHOW_HISTORY, store)
  if (typeof value === 'undefined') {
    return DEFAULT_SHOW_HISTORY
  }
  return !!value
}

export async function getShowLogs(): Promise<boolean> {
  const value = await get<boolean>(KEY_SHOW_LOGS, store)
  if (typeof value === 'undefined') {
    return DEFAULT_SHOW_LOGS
  }
  return !!value
}

export async function setShowHistory(status: boolean): Promise<void> {
  await set(KEY_SHOW_HISTORY, !!status, store)
}

export async function setShowLogs(status: boolean): Promise<void> {
  await set(KEY_SHOW_LOGS, !!status, store)
}
