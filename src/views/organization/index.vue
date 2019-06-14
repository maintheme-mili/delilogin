<template>
  <div class="organization">
    <div class="org">
      <TheNavbar></TheNavbar>
      <div class="org-box">
        <p class="org-choose">请选择</p>
        <div class="org-list-box">
          <ul class="org-list">
            <li @click="selectOrg(item)" v-for="item in orgLists" :key="item.id">
              <p>{{orgLists.name}}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import TheNavbar from './Navbar'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState([
      'orgLists'
    ])
  },
  created () {
    this.$store.dispatch('getOrgLists')
  },
  selectOrg (item) {
    /**
     * 先写入点击当前组织信息
     * 调用getOrgInfo方法获取组织详情
     * 路由跳转dashboard
     */
    this.$store.commit('GET_CURRENT_ORG', item)
    this.$store.dispatch('getOrgInfo')
  },
  components: {
    TheNavbar
  }

}
</script>

<style lang="scss">
.organization {
  height: 100%;
  overflow: hidden;
  background-image: url(~@/assets/login-bg.png);
  background-repeat: no-repeat;
  background-size: cover;
}
.org {
  height: 100%;
  overflow: auto;
  position: relative;

  &-choose {
    font-size: 30px;
    color: #fff;
    font-weight: bold;
    text-align: center;
    margin-top: 130px;
  }

  &-list-box {
    width: 991px;
    overflow: hidden;
    margin: 92px auto;
  }

  &-list {
    width: 1022px;
    // margin: 92px auto;
    // overflow: hidden;

    li {
      float: left;
      width: 480px;
      height: 80px;
      line-height: 80px;
      background-color: rgba(255, 255, 255, 0.4);
      border-radius: 4px;
      color: #ffffff;
      text-align: center;
      font-size: 24px;
      margin-bottom: 51px;
      margin-right: 31px;
      cursor: pointer;
    }
  }
}
</style>
