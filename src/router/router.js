import Vue from 'vue'
import Router from 'vue-router'

import Login from '../views/login'
import Organization from '@/views/organization'
import Dashboard from '@/views/dashboard'
import store from '@/store'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Dashboard
    },
    {
      path: '/login',
      component: Login
    },
    /**
     * 组织列表
     */
    {
      path: '/organization',
      component: Organization,
      meta: {
        // 需要登录
        auth: true
      },
      /**
       * @param {*} next dashboard
       * 判断组织个数
       * 只有一个组织直接进入控制台
       */
      beforeEnter (to, from, next) {
        if (store.state.orgLists.length === 1) {
          store.commit('GET_CURRENT_ORG', store.state.orgLists[0])
          // 跳转
          next({
            path: '/dashboard'
          })
        } else {
          // 进入点击的ye
          next()
        }
      }
    },

    /**
     * 工作台
     */
    {
      path: '/dashboard',
      component: Dashboard,
      meta: {
        // 需要登录
        auth: true
      }
    }
  ]
})
