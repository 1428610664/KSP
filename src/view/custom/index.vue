<template>
  <div class="wrapper-content clearFix">
    <div class="wrapper-box b float-l" style="width: 160px;margin-right: 10px;height: fit-content;">

      <Menu theme="light" :active-name="activeNenu" width="auto"  class="menu-wrapper" @on-select="changeMenu">
        <MenuGroup title="自定义字段">
          <template v-for="(item,i) in menuList">
            <MenuItem :name="item.path" :key="i"><Icon :type="item.icon"></Icon>{{item.title}}</MenuItem>
          </template>
        </MenuGroup>
      </Menu>

    </div>
    <div class="float-l" style="width:calc(100% - 170px);">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        activeNenu: this.$route.path,
        menuList: [
          {icon: 'ios-copy', path: "/custom/customer", title: "客户管理"},
          {icon: 'ios-copy', path: "/custom/contact", title: "联系人管理"},
          {icon: 'ios-copy', path: "/custom/activity", title: "活动管理"},
          {icon: 'ios-copy', path: "/custom/business", title: "商业管理"}
        ]
      }
    },
    created() {
      setTimeout(() => {

      }, 20)
    },
    watch: {
      '$route' (to, from) {
        this.activeNenu = to.path
      }
    },
    methods: {
      changeMenu(name){
        this.$router.push(name)
      }
    }
  }
</script>

<style scoped>
  .wrapper-content {
    margin: 10px;
  }

</style>
