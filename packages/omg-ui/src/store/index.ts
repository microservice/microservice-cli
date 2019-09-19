import Vue from 'vue'
import Vuex from 'vuex'

import config, { ConfigState } from './config'
import modals, { ModalsState } from './modals'

import { handleConfigUpdated } from '~/rpc/events'

Vue.use(Vuex)

export interface StoreState {
  config: ConfigState
  modals: ModalsState
}

const store = new Vuex.Store<StoreState>({
  modules: { config, modals },
  strict: process.env.NODE_ENV !== 'production',
})

handleConfigUpdated(configSchema => {
  store.commit('setConfig', configSchema)
})

export default store
