import Vue from 'vue'
import OMG from './OMG.vue'
import router from './router'
import store from './store'

if (process.env.NODE_ENV === 'development') {
  Vue.config.productionTip = true
}

new Vue({
  router,
  store,
  render: h => h(OMG),
}).$mount('#app')
