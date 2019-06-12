import Vue from 'vue'
import Router from 'vue-router'

import Login from '../views/login'
import Organization from '@/views/organization'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/organization',
      name: 'organization',
      meta: {
        auth: true
      },
      component: Organization
      // 路由守卫
    }
  ]
})
