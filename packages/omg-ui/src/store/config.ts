import { ConfigSchema } from '~/types'

export interface ConfigState {
  config: ConfigSchema | null
}

const defaultState: ConfigState = {
  config: null,
}

const mutations = {
  setConfig(state: ConfigState, newConfig: ConfigSchema | null) {
    state.config = newConfig
  },
}

const getters = {
  getConfig(state: ConfigState) {
    return state.config
  },
}

export default {
  state: defaultState,
  mutations,
  getters,
}
