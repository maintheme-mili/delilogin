// import router from '@/router'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'
export default {
  state: {
    uid: '',
    token: '',
    // 组织列表

    orgLists: [{ name: '得力智能研究院' }, { name: '得力集团' }],
    isAdmin: ''
  },

  actions: {
    // 获取组织列表
    async getOrgLists () {
      try {
        let res = await axios
          .get(
            `/gateway/v2.0/org/findOrgDetailByUserId?user_id=${Cookies.get('eplus_uid')}`,
            { headers: { 'X-Service-Id': 'organization', 'Authorization': Cookies.get('eplus_token'), 'client_id': 'eplus_web' }
            })
        if (res.data.code === 0) {
          // 传入组织列表到state GET_ORG_LIST
          console.log(res, '组织列表')
        }
      } catch (error) {
        Message({
          type: 'error',
          message: error
        })
      }
    },

    // 获取组织详情
    async getOrgInfo ({ commit }) {
      try {
        let res = await axios
          .get(`/gateway/v2.0/org/findOrgDetailByOrgId?org_id=${Cookies.get('eplus_orgid')}`, {
            herders: { 'X-Service-Id': 'organization', 'Authorization': Cookies.get('eplus_token'), 'client_id': 'eplus_web' }
          })
        if (res.code === 0) {
          // 将验证用户是否为管理员的结果 存入store中 IS_USER_ADMIN
          console.log(res, '管理员权限')
          commit('IS_USER_ADMIN', res.data.is_admin)
        }
      } catch (error) {
        console.log(error)
        Message({
          type: 'error',
          message: error
        })
      }
    }
  },

  mutations: {
    // 获取用户信息
    GET_USER_INFO (state, data) {
      state.uid = data.uid
      state.token = data.token
      // 格式化到期时间
      let expires = new Date(Number(data.expires))
      // 存入cookies
      Cookies.set('eplus_uid', data.uid, { expires })
      Cookies.set('eplus_token', data.token, { expires })
    },
    // 获取组织列表
    GET_ORG_LIST (state, data) {
      state.orgLists = data
    },
    // 获取当前组织详情
    GET_CURRENT_ORG (state, data) {
      state.orgName = data.name
      state.orgId = data.id
      Cookies.set('eplus_orgid', data.id)
    },
    // 检测用户管理员权限
    IS_USER_ADMIN (state, val) {
      state.isAdmin = val
    }
  }
}
