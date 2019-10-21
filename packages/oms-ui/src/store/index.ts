import Vue from 'vue'
import Vuex from 'vuex'
import getDeferredPromise from 'promise.defer'

import { buildImage } from '~/rpc'
import { configHasRequiredEnvs } from '~/common'
import { getEnvValues, getHistoricTabs, getShowHistory, getShowLogs } from '~/persistence'
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

const configReady = getDeferredPromise()
const appStatusReady = getDeferredPromise()
handleConfigUpdated(payload => {
  store.commit('setConfig', payload)
  configReady.resolve(payload.config)
})
handleConsoleLog(logLine => {
  store.commit('logConsoleLine', logLine)
})
handleDockerLog(logLine => {
  store.commit('logDockerLine', logLine)
})
handleAppStatusUpdated(({ status }) => {
  store.commit('setAppStatus', status)
  appStatusReady.resolve(status)
})

Promise.all([
  getEnvValues(),
  getHistoricTabs(),
  getShowHistory(),
  getShowLogs(),
  configReady.promise,
  appStatusReady.promise,
])
  .then(([envValues, historicTabs, showHistory, showLogs, appConfig, appStatus]) => {
    store.commit('setConfigEnvs', envValues)
    store.commit('setHistoricTabs', historicTabs)
    store.commit('setShowHistory', showHistory)
    store.commit('setShowLogs', showLogs)
    store.commit('setAppReady')

    if (configHasRequiredEnvs(appConfig, envValues)) {
      store.commit('openEnvironmentModal')
    } else if (appStatus === 'stopped') {
      buildImage()
    }
  })
  .catch(console.error)

export default store
