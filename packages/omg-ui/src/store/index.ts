import Vue from 'vue'
import Vuex from 'vuex'

import { getEnvValues, getHistoricTabs } from '~/persistence'
import { handleConfigUpdated, handleConsoleLog, handleDockerLog, handleAppStatusUpdated } from '~/rpc/events'

import config, { ConfigState } from './config'
import modals, { ModalsState } from './modals'
import logs, { LogsState } from './logs'
import actions, { ActionsState } from './actions'
import views, { ViewsState } from './views'

Vue.use(Vuex)

export interface StoreState {
  config: ConfigState
  modals: ModalsState
  logs: LogsState
  actions: ActionsState
  views: ViewsState
}

const store = new Vuex.Store<StoreState>({
  modules: { config, modals, logs, actions, views },
  strict: process.env.NODE_ENV !== 'production',
})

handleConfigUpdated(payload => {
  store.commit('setConfig', payload)
})
handleConsoleLog(logLine => {
  store.commit('logConsoleLine', logLine)
})
handleDockerLog(logLine => {
  store.commit('logDockerLine', logLine)
})
handleAppStatusUpdated(({ status }) => {
  store.commit('setAppStatus', status)
})

Promise.all([getEnvValues(), getHistoricTabs()])
  .then(([envValues, historicTabs]) => {
    store.commit('setConfigEnvs', envValues)
    store.commit('setHistoricTabs', historicTabs)
  })
  .catch(console.error)

export default store
