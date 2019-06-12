import Vue from 'vue'
import Vuex from 'vuex'

import global from './global'
import login from './modules/login'

Vue.use(Vuex)

export default new Vuex.Store({
  ...global,
  modules: {
    login
  }
})
