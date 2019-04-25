import Vue from 'vue'
import Router from 'vue-router'
import Environment from '@/views/Environment'
import Actions from '@/views/Actions'
import History from '@/views/History'
import Editor from '@/views/Editor'
import Documentation from '@/views/Documentation'
import Inspect from '@/views/Inspect'
import Home from '@/views/Home'

import store from './store'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/environments',
      name: 'environments',
      component: Environment
    },
    {
      path: '/actions/:action',
      name: 'actions',
      component: Actions,
      props: route => ({ query: route.query }),
      beforeEnter: (to, from, next) => {
        setTimeout(() => {
          next(
            store.getters.getMicroserviceActionList.includes(to.params.action)
              ? true
              : { name: 'home' }
          )
        }, 500)
      }
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/editor',
      name: 'editor',
      component: Editor
    },
    {
      path: '/documentation',
      name: 'documentation',
      component: Documentation
    },
    {
      path: '/inspect',
      name: 'inspect',
      component: Inspect
    },
    {
      path: '/',
      name: 'home',
      component: Home
    }
  ]
})
