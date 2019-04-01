import Vue from 'vue'
import Router from 'vue-router'
import Environment from '@/views/Environment'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/environment',
      name: 'environment',
      component: Environment
    }
  ]
})
