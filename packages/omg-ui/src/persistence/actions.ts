import { get, set, del } from 'idb-keyval'
import { ActionTabHistoric } from '~/store/actions'

import { store } from './common'

const KEY_HISTORIC_TABS = 'actions-historic-tabs'

export async function getHistoricTabs(): Promise<ActionTabHistoric[]> {
  const serialized = await get<string>(KEY_HISTORIC_TABS, store)
  if (!serialized) {
    return []
  }
  const { version, tabs } = JSON.parse(serialized)

  if (version === 1) {
    return tabs
  }

  return []
}

export async function setHistoricTabs(tabs: ActionTabHistoric[]): Promise<void> {
  await set(KEY_HISTORIC_TABS, JSON.stringify({ tabs, version: 1 }), store)
}

export async function clearHistoricTabs(): Promise<void> {
  await del(KEY_HISTORIC_TABS, store)
}
