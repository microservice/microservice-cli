import Vue from 'vue'
import VueToasted from 'vue-toasted'
import VueTimeago from 'vue-timeago'

import OMG from './views/index.vue'
import store from './store/index.ts'

import 'normalize.css'
import 'vue-select/dist/vue-select.css'

Vue.use(VueTimeago, {
  name: 'Timeago',
})
Vue.use(VueToasted)

new Vue({
  store,
  render: h => h(OMG),
}).$mount('#app')
