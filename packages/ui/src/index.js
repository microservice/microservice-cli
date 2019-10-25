import 'core-js'

import Vue from 'vue'
import VueToasted from 'vue-toasted'
import VueTimeago from 'vue-timeago'

import App from './views/index.vue'
import store from './store/index.ts'
import { handleKeyboardEvent } from '~/services/keyboard'

import 'normalize.css'
import 'vue-select/dist/vue-select.css'

Vue.use(VueTimeago, {
  name: 'Timeago',
})
Vue.use(VueToasted)

// Render the App
new Vue({
  store,
  render: h => h(App),
}).$mount('#app')

window.addEventListener('keydown', handleKeyboardEvent)
