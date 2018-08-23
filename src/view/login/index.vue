<template>
  <div class="login-wrapper posct">
    <div class="header-wrapper clear">
      <div class="logo-wrapper posct fl">
        <img src="https://www.juniwota.com/qj/mice/static/img/logo_core.f06b04f.gif" height="46">
      </div>
      <div class="menu-list-wrapper fr c fz14">
        <a class="hover">首页</a> |
        <a class="hover">功能服务</a> |
        <a class="hover">购买服务</a> |
        <a class="hover">联系我们</a>
      </div>
    </div>

    <div class="login-content b wrapper-box">
      <div class="ct c2 m-t10 m-b15">
        <span class="fz16">账号登录</span>
      </div>
      <!--<div class="ipu-wrapper">-->
        <!--<i-input type="text" v-model="formLogin.account " placeholder="请输入公司账号..." @on-enter="loginEvent">-->
          <!--<Icon type="ios-ribbon-outline" slot="prepend"></Icon>-->
        <!--</i-input>-->
      <!--</div>-->
      <div class="ipu-wrapper">
        <i-input type="text" v-model="formLogin.userName" :maxlength="11" placeholder="请输入用户名..." @on-enter="loginEvent">
          <Icon type="ios-person-outline" slot="prepend"></Icon>
        </i-input>
      </div>
      <div class="ipu-wrapper">
        <i-input type="password" v-model="formLogin.passWord" placeholder="请输入您的密码..." @on-enter="loginEvent">
          <Icon type="ios-lock-outline" slot="prepend"></Icon>
        </i-input>
      </div>
      <div class="ipu-wrapper">
        <Button type="primary" long style="height: 38px" @click="loginEvent">登录</Button>
      </div>
      <div class="ipu-wrapper clear">
        <Checkbox label="twitter" class="c3">记住我</Checkbox>
        <!--<a class="c1 fr">免费注册</a>-->
      </div>
    </div>
    <div class="footer c fz12 ct">Copyright ©广州科微软件有限公司版权所有.</div>
  </div>
</template>

<script>

  import utils from 'common/js/utils'
  import {mapActions, mapGetters} from 'vuex'

  export default {
    name: "index",
    data() {
      return {
        formLogin: {
          userName: '',
          passWord: ''
        }
      }
    },
    computed: {
      ...mapGetters([
        'isLogin',
        'userData'
      ])
    },
    created() {
      setTimeout(() => {
        this.logoutAction()
      }, 20)
    },
    methods: {
      loginEvent(){
        if(utils.isEmpty(this.formLogin.userName)) {
          this.$Message.warning('请输入用户名')
          return
        }
        if(utils.isEmpty(this.formLogin.passWord)) {
          this.$Message.warning('请输入密码')
          return
        }
        this.requestAjax('post', 'login', this.formLogin).then(res => {
          if(res.success) {
            this.loginAction(res.data)
          }else {
            this.$Message.warning(res.desc)
          }
        }, error => {

        })
      },
      ...mapActions([
        'loginAction',
        'logoutAction'
      ])
    }
  }
</script>

<style scoped>

  .login-wrapper{
    height: 100vh;
    background: url(https://cdn.huodongxing.com/Content/v2.0/img/login_bg.jpg?auth_key=1529497541-0-0-ce4a440%E2%80%A6) no-repeat center;
    background-size: cover;
    position: relative;
  }

  .footer{line-height: 46px;width: 100%; position: fixed; bottom: 0;left: 0; z-index: 99}

  .header-wrapper{
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 50px;
  }
  .logo-wrapper{
    width: 160px;
    height: 100%;
  }

  .menu-list-wrapper{
    line-height: 50px;
    padding-right: 20px;
  }
  .menu-list-wrapper a{
    padding: 0 6px;
  }

  .login-content{
    width: 480px;
    padding-bottom: 20px;
  }

  .ipu-wrapper{
    padding: 0 16px;
    margin-bottom: 14px;
  }
</style>
