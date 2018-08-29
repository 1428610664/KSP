<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

  import {mapGetters} from 'vuex'
  import {setIsLogin, setUserInfo,setUserId} from 'common/js/cache'

export default {
  computed: {
    ...mapGetters([
      'isLogin',
      'userData'
    ])
  },
  created(){
    this.$nextTick(() => {
      if(!(this.isLogin && (typeof this.isLogin == 'boolean')))  this.$router.replace({path:"/login"})
    })
  },
  watch: {
    $route (to, from) {
      document.title = to.name
    },
    isLogin (login) {
      if(login) {
        this.$router.replace({path:"/index"})
      }else{
        this.$router.replace({path:"/login"})
      }
      setIsLogin(login)
    },
    userData (newData) {
      setUserInfo(newData)
      setUserId(newData ? newData.user.id : '')
    }
  },
}
</script>

<style>

  @import 'common/css/common'

</style>
