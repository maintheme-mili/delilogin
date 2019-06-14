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
                    <div ref="qrcode"></div>
                  </div>
                  <div class="mask" v-if="showTips">
                    <!-- 两种提示 -->
                    <div class="mask-success" v-if="isScanning">
                      <img src="~@/assets/success.png" alt="">
                      <h3>扫码成功</h3>
                    </div>
                    <div class="mask-failed" v-else>
                      <h3>二维码已失效</h3>
                      <p>请刷新后重新扫码登陆</p>

                      <button class="refreash" @click="refreashScan">请点击刷新</button>
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
                <button class="loginbtn" @click="login" :disabled="isDisabled">登录</button>
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
import { Message } from 'element-ui'
export default {
  title: '得力e+ 登陆',
  data () {
    return {
      activeName: 'qrcode',
      phone: '',
      password: '',
      errMsg: '',
      // 初始状态不需要刷新， 过期需要刷新
      isExpired: false,
      timerout: null,
      isDisabled: false
      // qrcode: ''
    }
  },

  computed: {
    isShowQrcodeTab () {
      return this.activeName === 'qrcode'
    },
    ...mapState('login', [
      'isScanning'
    ]),
    showTips () {
      // 正在扫描或者已经过期(需要刷新)
      return this.isScanning || this.isExpired
    }
  },
  mounted () {
    this.init()
  },
  // 监听
  watch: {
    isShowQrcodeTab (val) {
      // 初始化：取消正在扫码(更新store中的isScanning为false)

      if (val) {
        this.$store.commit('login/UPDATE_SCAN_STATE', false)
        // 刷新二维码
        this.refreashScan()
        this.scanTimerout()
      } else {
        // 不在扫码页面 清除定时器
        clearTimeout(this.timerout)
      }
    }
  },

  methods: {
    login () {
      if (!this.phone) {
        this.errMsg = '手机号和密码不能为空'
      } else if (!this.password) {
        this.errMsg = '手机号和密码不能为空'
      } else {
        this.isDisabled = true
        axios
          .post('/gateway/v2.0/auth/loginMobile',
            {
              'mobile': this.phone,
              'password': md5(this.password)
            },
            {
              headers: {
                'client_id': 'eplus_web',
                'X-Service-Id': 'userauth'
              }
            }
          )
          .then(res => {
            if (res.status === 200 && res.data.code === 0) {
              // console.log(res)
              // 存入token和uid
              this.$store.commit('GET_USER_INFO', res.data.data)
              this.$router.push('/organization')
              // 启用按钮
              this.isDisabled = false
            } else {
              this.errMsg = res.data.msg
              // 启用按钮
              this.isDisabled = false
            }
          }).catch(error => {
            this.errMsg = error
            // 获取错误信息以后启用按钮
            this.isDisabled = false
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
        // console.log(evt.data)
        // 字符串转对象
        let res = JSON.parse(evt.data)
        if (!res) {
          console.log('ws传输失败')
          return
        }
        /**
           * 通过 res.event判断当前用户行为
           * 当扫码时候提醒手机点击确认登陆
           * 当点击确认登陆时，存入token和uid到store中
           */
        if (res.event === 'session_created') {
          /**
           * 发请求获取二维码请求url
           * 通过url创造二维码
           * res.data为sid websocket的id
           */
          // console.log(this.getQrcodeUrl(res.data))
          this.getQrcodeUrl(res.data)
            .then(url => {
              this.createQrcode(url)
              this.scanTimerout()
            })
            .catch(err => {
              console.log(err)
              Message({
                type: 'error',
                message: err
              })
              // 二维码获取失败的异常
            })
          //   .then(url => this.createQrcode())
        }
        // 扫码成功后
        if (res.event === 'eplus_web.login.scan') {
          // 更改store中isScanning的状态,显示mask-success块
          this.$store.commit('login/UPDATE_SCAN_STATE', true)
          // 扫码成功后未点击确认到时间二维码失效
          this.scanTimerout()
        }
        // 扫码成功并且确认登陆成功后
        if (res.event === 'eplus_web.login.confirm') {
          // 存入从后端拿到的token到store中并存入cookies中
          this.$store.commit('GET_USER_INFO', res.data)
          // 路由跳转
          this.$router.push('/organization')
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
        // let res = await api.getLoginQrcodeUrl({ client_id: 'eplus_web', sid })
        let res = await axios
          .post(
            '/gateway/v2.0/qr/generatorLoginCode',
            { client_id: 'eplus_web', sid },
            {
              headers: { 'X-Service-Id': 'qr' }
            })
        if (res.data.code === 0) {
          // console.log(res.data.data)
          return res.data.data
        }
      } catch (error) {
        Message({
          type: 'error',
          message: error
        })
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
        // 防止添加多张二维码
        this.qrcode.clear()
        this.qrcode.makeCode(url)
      } else {
        this.qrcode = new QRCode(this.$refs.qrcode, {
          text: url,
          width: 160,
          height: 160,
          correctLevel: QRCode.CorrectLevel.L
        })
        this.scanTimerout()
      }
    },
    /**
     * 设置二维码过期时间
     */
    scanTimerout () {
      clearTimeout(this.timerout)
      this.timerout = setTimeout(() => {
        // 控制刷新提示的显示
        this.isExpired = true
      }, 5000)
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
  min-width: 1200px;
  background-image: url(~@/assets/login-bg.png);
  height: 100%;
  overflow: hidden;
  background-size: cover;

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
          transform: translate(-50%, -50%);
        }

        &-login {
          position: relative;
          width: 160px;
          height: 160px;
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
            margin: -3px 5px;
          }
        }
      }
    }
    &-pane {
      position: relative;
      height: 100%;

      .form {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        &-item {
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
          border: 1px solid #eaeaea;
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
          background-color: #5d85e0;
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
          color: #ff534d;
        }
      }
      .login-img {
        position: absolute;
      }
      .mask {
        background: rgba(255, 255, 255, 0.9);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        text-align: center;

        &-failed {
          width: 130px;
          height: 101px;
          margin: 32px auto;
          color: #000000;

          h3 {
            font-size: 16px;
            font-weight: Regular;
            margin-bottom: 11px;
            // letter-spacing: 100;
          }

          p {
            font-size: 12px;
            margin-bottom: 31px;
          }

          button {
            width: 120px;
            height: 30px;
            background: #5d85e0;
            outline: none;
            border: 0;
            border-radius: 4px;
            font-size: 14px;
            color: #fff;
          }
        }

        &-success {
          width: 70px;
          margin: 40px auto;

          img {
            margin-bottom: 15px;
          }

          h3 {
            font-size: 16px;
            font-weight: Regular;
            color: #000;
          }
        }
      }
    }
  }
}
</style>
