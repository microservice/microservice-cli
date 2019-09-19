import Vue from 'vue'
import Vuex from 'vuex'

import config, { ConfigState } from './config'
import modals, { ModalsState } from './modals'
import logs, { LogsState } from './logs'

import { handleConfigUpdated, handleConsoleLog, handleDockerLog } from '~/rpc/events'

Vue.use(Vuex)

export interface StoreState {
  config: ConfigState
  modals: ModalsState
  logs: LogsState
}

const store = new Vuex.Store<StoreState>({
  modules: { config, modals, logs },
  strict: process.env.NODE_ENV !== 'production',
})

handleConfigUpdated(configSchema => {
  store.commit('setConfig', configSchema)
})
handleConsoleLog(logLine => {
  store.commit('logConsoleLine', logLine)
})
handleDockerLog(logLine => {
  store.commit('logDockerLine', logLine)
})

export default store
