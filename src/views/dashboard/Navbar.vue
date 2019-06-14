<template>
  <div class="dashboard">
    <div class="top">
      <div class="content">
        <div class="content-left">
          <img src="~@/assets/logo.png" alt="">
          <h3>得力智能研究院</h3>
          <button class="org-btn" v-if="orgLists.length" @click="$router.push('/organization')">切换</button>
          <p v-if="isAdmin" class="manager">管理</p>
          <p class="work">工作台</p>
        </div>
        <div class="content-right">1</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      isAdmin: state => state.isAdmin,
      orgLists: state => state.orgLists
    })
  }
}
</script>

<style lang="scss">
.dashboard {
  background: #f6f6f6;

  .top {
    width: 100%;
    height: 70px;
    background-color: #fff;
    box-shadow: 0px 1px 10px 0px rgba(3, 42, 42, 0.1);

    .content {
      width: 1200px;
      height: 100%;
      margin: 0 auto;
      position: relative;

      &-left {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 484px;
        height: 50px;
        line-height: 50px;
        // background-color: pink;

        img {
          float: left;
          margin-right: 10px;
        }
      }
      h3 {
        float: left;
        color: #333333;
        font-size: 16px;
        margin-right: 9px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .org-btn {
        width: 40px;
        height: 20px;
        border: 1px solid #5d85e0;
        color: #5d85e0;
        background-color: #fff;
        font-size: 12px;
        border-radius: 5px;
        outline: none;
      }

      p {
        position: absolute;
        right: 0;
        top: 0;
        font-size: 16px;
        font-weight: bold;
      }

      .work {
        right: 107px;
      }

      &-right {
        float: right;
        width: 27px;
        height: 100%;
      }
    }
  }
}
</style>
