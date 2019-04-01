import Vue from 'vue'
import Router from 'vue-router'
import Environment from '@/views/Environment'
import Actions from '@/views/Actions'
import History from '@/views/History'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'environment',
      component: Environment
    },
    {
      path: '/actions',
      name: 'actions',
      component: Actions
    },
    {
      path: '/history',
      name: 'history',
      component: History
    }
  ]
})
