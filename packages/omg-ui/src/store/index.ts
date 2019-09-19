import Vue from 'vue'
import Vuex from 'vuex'

import config from './config'
import modals from './modals'

import { handleConfigUpdated } from '~/rpc'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: { config, modals },
  strict: process.env.NODE_ENV !== 'production',
})

handleConfigUpdated(configSchema => {
  store.commit('setConfig', configSchema)
})

export default store
