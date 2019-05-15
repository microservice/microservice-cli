import Vue from 'vue'
import Router from 'vue-router'
import Environment from '@/views/Environment'
import Actions from '@/views/Actions'
import History from '@/views/History'
import Editor from '@/views/Editor'
import Documentation from '@/views/Documentation'
import Inspect from '@/views/Inspect'
import Home from '@/views/Home'
import Forward from '@/views/Forward'
import ValidationError from '@/views/ValidationError'

import store from './store'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/environments',
      name: 'Environment Variables',
      component: Environment,
      beforeEnter: (to, from, next) => {
        next(
          store.getters.getMicroserviceStatus
            ? true
            : { path: '/validation-error' }
        )
      }
    },
    {
      path: '/actions/:action',
      name: 'actions',
      component: Actions,
      props: route => ({ query: route.query }),
      beforeEnter: (to, from, next) => {
        if (!store.getters.getMicroserviceStatus) {
          next({ path: '/validation-error' })
        }
        setTimeout(() => {
          next(
            store.getters.getMicroserviceActionList.includes(to.params.action)
              ? true
              : { name: 'Home' }
          )
        }, 500)
      }
    },
    // {
    //   path: '/history',
    //   name: 'history',
    //   component: History
    // },
    // {
    //   path: '/editor',
    //   name: 'microservice.yml Live Editor',
    //   component: Editor
    // },
    // {
    //   path: '/documentation',
    //   name: 'documentation',
    //   component: Documentation
    // },
    // {
    //   path: '/inspect',
    //   name: 'inspect',
    //   component: Inspect
    // },
    {
      path: '/forward',
      name: 'Forward',
      component: Forward,
      beforeEnter: (to, from, next) => {
        next(
          store.getters.getMicroserviceStatus
            ? true
            : { path: '/validation-error' }
        )
      }
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: (to, from, next) => {
        next(
          store.getters.getMicroserviceStatus
            ? true
            : { path: '/validation-error' }
        )
      }
    },
    {
      path: '/validation-error',
      name: 'microservice.yml validation',
      component: ValidationError,
      beforeEnter: (to, from, next) => {
        next(store.getters.getMicroserviceStatus ? { name: 'Home' } : true)
      }
    }
  ]
})
