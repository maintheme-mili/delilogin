// import router from '@/router'
import Cookies from 'js-cookie'
export default {
  state: {
    uid: '',
    token: '',
    orgLists: ''
  },

  actions: {

  },

  mutations: {
    GET_USER_INFO (state, data) {
      state.uid = data.uid
      state.token = data.token
      // 格式化到期时间
      let expires = new Date(Number(data.expires))
      // 存入cookies
      Cookies.set('c_uid', data.uid, { expires })
      Cookies.set('c_token', data.token, { expires })
    }
  }
}
