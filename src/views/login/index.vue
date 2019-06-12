<template>
  <div class="login">
    <div class="login-wrap">
      <!-- logo -->
      <div class="header">
        <img src="~@/assets/logo.png" class="logo">
        <img src="~@/assets/logo-text.png" class="logo-text">
      </div>
      <div class="login-box clearfix">
        <img src="~@/assets/login-picture.png" class="login-picture">
        <div class="login-tab">
          <ul class="tab-items clearfix">
            <li :class="['tab-item',{'active-tab': isShowQrcodeTab}]" @click="activeName = 'qrcode'">扫码登陆</li>
            <div class="line"></div>
            <li :class="['tab-item',{'active-tab': !isShowQrcodeTab}]" @click="activeName = 'password'">账号登陆</li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane" v-show="isShowQrcodeTab">
              <!-- 二维码登陆 -->
              <div class="qrcode-box">
                <div class="qrcode-login">
                  <div class="login-img">
                    <div ref="qrcode">
                      <img src="~@/assets/ps7148ab35fa9dec63-84e8-4049-bce5-062eae209228_03.png" alt="">
                    </div>
                  </div>
                  <div class="mask" v-if="showTips">
                    <!-- 两种提示 -->
                    <div class="mask-success" v-if="isScanning">
                      <p>成功</p>
                    </div>
                    <div class="mask-failed" v-else>
                      <p>失败</p>
                      <button class="refreash" @click="refreashScan" value="重置"></button>
                    </div>
                  </div>
                </div>
                <div class="qrcode-footer">
                  <div v-if="!isScanning">请用<img src="~@/assets/logo-text.png">扫描二维码登陆</div>
                  <div v-else>请在手机中点击“确认登陆”</div>
                </div>
              </div>
            </div>
            <div class="tab-pane" v-show="!isShowQrcodeTab">
              <!-- 账号登陆 -->
              <div class="form">
                <div class="form-item mb30">
                  <input type="phone" v-model="phone" autocomplete="off" placeholder="请输入手机号">
                  <div class="form-line"></div>
                  <img src="~@/assets/ic_phone.png" alt="">
                </div>
                <div class="form-item mb60">
                  <input type="password" v-model="password" autocomplete="off" placeholder="请输入密码">
                  <div class="form-line"></div>
                  <img src="@/assets/ic_password.png" alt="">
                </div>
                <p class="err-text">{{errMsg}}</p>
                <button class="loginbtn" @click="login">登陆</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import * as api from '@/api'
import md5 from 'md5'
import axios from 'axios'
import QRCode from '@/utils/qrcode'

export default {
  title: '得力e+ 登陆',
  data () {
    return {
      activeName: 'qrcode',
      phone: '',
      password: '',
      errMsg: '',
      // 初始状态不需要刷新， 过期需要刷新
      isExpired: 'false',
      timerout: null,
      qrcode: ''
    }
  },

  computed: {
    isShowQrcodeTab () {
      return this.activeName === 'qrcode'
    },
    ...mapState([
      'isScanning'
    ]),
    showTips () {
      // 正在扫描或者已经过期(需要刷新)
      return this.isScaning || this.isExpired
    }
  },
  // 监听
  watch: {
    isShowQrcodeTab (val) {
      // 初始化：取消正在扫码(更新store中的isScanning为false)

      if (val) {
        this.$store.commit('login/UPDATE_SCAN_STATE', false)
        // 刷新二维码
        this.refreashScan()
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    login () {
      if (!this.phone) {
        this.errMsg = '手机号和密码不能为空'
      } else if (!this.password) {
        this.errMsg = '手机号和密码不能为空'
      } else {
        axios
          .post('/test/api/2.0/login', {
            'expire_time': 0,
            'mobile': this.phone,
            'mobile_region': '86',
            'multi_login': false,
            'password': md5(this.password)
          }, {
            headers: {
              'client_id': 'EAPP'
            }
          })
          .then(res => {
            if (res.status === 200 && res.data.code === 0) {
            // console.log(res)
            // 存入token和uid
              this.$store.commit('GET_USER_INFO', res.data.data)
              this.$router.push('/organization')
            } else {
              this.errMsg = res.data.msg
            }
          })
      }
    },

    // 二维码初始化
    init () {
      this.connectws()
    },
    connectws () {
      let ws = new WebSocket('ws://192.168.0.204:9002/websocket')
      ws.onmessage = evt => {
        console.log(evt.data)
        // 字符串转对象
        let res = JSON.parse(evt.data)
        if (!res) {
          console.log('ws传输失败')
          return
        }
        if (res.event === 'session_created') {
          /**
           * 发请求获取二维码请求url
           * 通过url创造二维码
           * res.data为sid websocket的id
           */
          this.getQrcodeUrl(res.data)
        }
        ws.close()
      }
    },
    /**
     * 二维码登录url的获取
     * 发请求
     */
    async getQrcodeUrl (sid) {
      try {
        let res = await axios
          .post(
            '/gateway/v2.0/qr/generatorLoginCode',
            { client_id: 'eplus_web', sid },
            { headers: { 'X-Service-Id': 'qr' } }
          )
        console.log(res)
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * 生产二维码url
     * 创造二维码：
     *     1. 宽度 width
     *     2. 高度 height
     *     3. url text
     *     4. 容错级别 correctLevel
     */
    createQrcode (url) {
      if (this.qrcode) {
        // 清除之前的，创建最新的
        this.qrcode.clear()
        this.qrcode.makeCode(url)
      } else {
        this.qrcode = new QRCode('qrcode', {
          text: 'url',
          width: 160,
          height: 160,
          correctLevel: QRCode.correctLevel.H
        })
      }
    },
    /**
     * 设置二维码过期时间
     */
    scanTimerout () {
      this.timerout = setTimeout(() => {
        // 控制刷新提示的显示
        this.isExpired = true
      }, 10000)
    },

    /**
     * 刷新二维码
     */
    refreashScan () {
      this.init()
      // 恢复初始值
      this.isExpired = false
    }
  }
}
</script>

<style lang="scss">
  .login {
    min-height: 600px;
    min-width:  1200px;
    background-image: url(~@/assets/login-bg.png);
    height: 100%;
    overflow: hidden;
    background-size:cover;

    &-wrap {
      max-width: 1200px;
      min-width: 900px;
      width: 62.5%;
      height: 100%;
      margin: 0 auto;
      position: relative;

      .header {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        z-index: 99;

        .logo {
          margin-right: 20px;
        }
        .logo-text {
          vertical-align: top;
          margin-top: 15px;
        }
      }
    }

    &-box {
      position: absolute;
      top: 160px;
      left: 0;
      right: 0;
    }

    &-picture {
      float: left;
      width: 68%;
    }

    &-tab {
      height: 100%;
      background: #ffffff;
      max-width: 385px;
      width: 32%;
      position: absolute;
      left: 68%;
      right: 0%;
      top: 0;
    }

    .tab {
      &-items {
        border-bottom: 1px solid #eaeaea;
        position: relative;

        .line {
        width: 1px;
        height: 30px;
        background: #eaeaea;
        left: 50%;
        top: 50%;
        margin-top: -15px;
        position: absolute;
      }

      .active-tab {
        color: #5d85e0;
      }

      }

      &-item {
        float: left;
        width: 50%;
        text-align: center;
        font-size: 18px;
        padding: 25px 0px;
        cursor: pointer;
      }
      &-content {
        height: calc(100% - 69px);

        .qrcode {
          &-box {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%)
          }

          &-login {
            position: relative;
            width: 160px;
            margin: 0 auto;
          }

          &-footer {
            width: 220px;
            text-align: center;
            margin-top: 30px;
            font-size: 16px;
            color: #333333;
            img {
              height: 16px;
              margin: 0 5px;
            }
          }
        }

      }
      &-pane {
        position: relative;
        height: 100%;

        .form{
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);

          &-item{
            position: relative;

            img {
              position: absolute;
              left: 11px;
              top: 9px;
              width: 26px;
              height: 26px;
            }

          }

          input {
            width: 280px;
            height: 40px;
            border-radius: 5px;
            border:1px solid #EAEAEA;
            padding-left: 59px;
            font-size: 14px;
            outline: none;
          }

          &-line {
            position: absolute;
            bottom: 10px;
            left: 40px;
            width: 1px;
            height: 20px;
            background-color: #cccccc;
          }

          .loginbtn {
            width: 280px;
            height: 40px;
            background-color: #5D85E0;
            // outline: none;
            border: 0;
            border-radius: 5px;
            font-size: 16px;
            color: white;
            letter-spacing: 5px;
          }

          .err-text {
            position: absolute;
            top: 118px;
            left: 0px;
            font-family: SimSun;
            font-size: 14px;
            color: #FF534D;
          }
        }
      }
    }

  }
</style>
