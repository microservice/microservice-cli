import Vue from 'vue'
import Vuex from 'vuex'

import modals from './modals'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { modals },
  strict: process.env.NODE_ENV !== 'production',
})
