import Vue from 'vue'
import OMG from './views/index.vue'
import store from './store/index.ts'

import 'normalize.css'

new Vue({
  store,
  render: h => h(OMG),
}).$mount('#app')
