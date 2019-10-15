import Vue from 'vue'
import OMG from './OMG.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(OMG),
}).$mount('#app')
