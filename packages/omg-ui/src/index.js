import Vue from 'vue'
import OMG from './views/index.vue'
import router from './router'
import store from './store'

import 'normalize.css'

new Vue({
  router,
  store,
  render: h => h(OMG),
}).$mount('#app')
