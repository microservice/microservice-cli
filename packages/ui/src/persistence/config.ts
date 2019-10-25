import { set, get, del } from 'idb-keyval'
import { store } from './common'

const KEY_ENV_VALUES = 'config-env-values'

export async function getEnvValues(): Promise<Record<string, string>> {
  const value = await get<string>(KEY_ENV_VALUES, store)

  if (!value) {
    return {}
  }
  const { envValues, version } = JSON.parse(value)

  if (version === 1) {
    return envValues
  }
  return {}
}

export async function setEnvValues(envValues: Record<string, string>): Promise<void> {
  await set(KEY_ENV_VALUES, JSON.stringify({ envValues, version: 1 }), store)
}

export async function clearEnvValues(): Promise<void> {
  await del(KEY_ENV_VALUES, store)
}
