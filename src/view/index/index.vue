<template>

  <div class="wrapper-content">
    <div class="app-header b c3 bezier" :style="{paddingLeft: toggleMenu ? '0px' : '200px'}">
      <!--<Row type="flex" justify="end">
        <i-col class="header-col"><Icon class="fz16" style="vertical-align: sub" type="md-time" /> {{systemDate}}</i-col>
        <i-col class="header-col"><a class="hover-c3" @click="feedbackEvent"><Icon class="fz16" style="vertical-align: sub" type="md-clipboard" /> 反馈问题</a></i-col>
        <i-col class="header-col">
          <Dropdown @on-click="handleSubmit">
            <a href="javascript:void(0)" class="hover-c3"><Icon class="fz18" style="vertical-align: sub" type="ios-person" /> 管理员：{{userData ? userData.user.name : ''}}<Icon type="arrow-down-b"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="info">企业信息</DropdownItem>
              <DropdownItem name="modifyPsw" divided>修改密码</DropdownItem>
              <DropdownItem  name="logout" divided>退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </i-col>
      </Row>-->
      <div class="fbox">
        <div class="flex">
          <div class="fl m-l15 cursor-p" @click="toggleMenuEvent"><Icon type="md-menu" size="20" /></div>
        </div>
        <div class="header-col"><Icon class="fz16" style="vertical-align: sub" type="md-time" /> {{systemDate}}</div>
        <div class="header-col"><a class="hover-c3" @click="feedbackEvent"><Icon class="fz16" style="vertical-align: sub" type="md-clipboard" /> 反馈问题</a></div>
        <div class="header-col">
          <Dropdown @on-click="handleSubmit">
            <a href="javascript:void(0)" class="hover-c3"><Icon class="fz18" style="vertical-align: sub" type="ios-person" /> 管理员：{{userData ? userData.user.name : ''}}<Icon type="arrow-down-b"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="info">企业信息</DropdownItem>
              <DropdownItem name="modifyPsw" divided>修改密码</DropdownItem>
              <DropdownItem  name="logout" divided>退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
    <div class="cloud-left-menu bezier"  :style="{left: toggleMenu ? '-200px' : '0px'}">

      <div class="user-pic-wrapper posct cursor-p"><img src="../../common/images/logo.jpg"></div>

      <Menu :active-name="activeNenu" :accordion="true" ref="refName" theme="dark" @on-select="changeMenu" class="menu-wrapper" style="height: calc( 100vh - 156px ); overflow: hidden">
        <template v-for="(v, k, i) in loadMian">
          <Submenu v-if="v.children != undefined" :name="v.path" class="text-a-left">
            <template slot="title">
              {{v.title}}
            </template>
            <Menu-item v-for="(v2, k2, i2) in v.children" :name="v2.path" :key="i2">
              <span class="layout-text">{{v2.title}}</span>
            </Menu-item>
          </Submenu>
          <Menu-item v-else :name="v.path" class="text-a-left">
            {{v.title}}
          </Menu-item>
        </template>
      </Menu>
      <div class="footer c3 fz12 ct">Copyright ©广州科微</div>
    </div>
    <div class="app-content bezier" :style="{paddingLeft: toggleMenu ? '0px' : '200px'}">
      <transition name="fade-transform" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>

    <input-from v-if="inputForm.show" @changeOptions="getInputVal" :options="inputForm.option" :value="inputForm.value" :modalDisabled="inputForm.modalDisabled"
                :modalshow="inputForm.modalshow"></input-from>
  </div>

</template>

<script>

  import {mapActions, mapGetters} from 'vuex'
  import inputFrom from 'components/model/inputFrom.vue'

  export default {
    data() {
      return {
        toggleMenu: false,
        systemDate: new Date().format('yyyy-MM-dd hh:mm:ss'),
        type: 0,
        permissionUrls: [],
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        activeNenu: this.$route.path,
        loadMian: [],
      }
    },
    computed: {
      ...mapGetters([
        'userData'
      ])
    },
    watch: {
      $route (to, from) {
        let roterName = this.$route.path.split('/')[1]
        if(this.permissionUrls.indexOf(roterName) == -1) {
          this.$router.replace({path:"/index"})
        }
      }
    },
    beforeCreate(){
      this.$nextTick(() => {
        this._initSystemDate()
        if(this.userData) this.requestMenusByRoleId(this.userData.user.role)
      })
    },

    methods: {
      ...mapActions([
        'logoutAction',
      ]),
      requestMenusByRoleId(id){
        this.requestAjax('get', 'menusByRoleId', {roleId: id}).then(res => {
          if(res.success) {
            this.loadMian = this._parseMenus(res.data.rows)
            this.$nextTick(() => {
              this.initScroll(document.querySelectorAll('.menu-wrapper'))
              this.$refs.refName.updateActiveName()
              let roterName = this.$route.path.split('/')[1]
              if(this.permissionUrls.indexOf(roterName) == -1) {
                this.$router.replace({path:"/index"})
              }
            })
          }else{
            this.$Message.warning('加载失败')
          }
        })
      },
      _parseMenus(data){
        let menusList = [],menus = [],urls = []
        data.forEach(item => {
          if(item.parentId == '-'){
            let _i = this._findIndex(menusList, item.id)
            if( _i == -1) {
              menusList.push({path: item.id, title: item.name, children: []})
            }else{
              menusList[_i].title = item.name
            }
          }else{
            if(item.selected === 'true'){
              let _i = this._findIndex(menusList, item.parentId)
              if( _i == -1) {
                menusList.push({path: item.parentId, title: item.name, children: [{path: item.url, title: item.name}]})
              }else{
                menusList[_i].children.push({path: item.url, title: item.name})
              }
              urls.push(item.url)
            }
          }
        })
        this.permissionUrls = urls.join(',')
        menusList.forEach(item => {
          if(item.children.length> 0) menus.push(item)
        })
        return menus
      },
      _findIndex(data, id){
        return data.findIndex(item => {
          return item.path == id
        })
      },
      changeMenu (name) {
        this.routePush(name)
      },
      handleSubmit(name){
        switch (name) {
          case 'info':
            this.showModalEvent(null, 1)
            break
          case 'modifyPsw':
            this.showModalEvent(null, 0)
            break
          case 'logout':
            this.$Modal.confirm({title: '提示',content: '确认退登录？',
              onOk: () => {
                this.logoutAction()
              }
            })
            break
        }
      },
      feedbackEvent(){
        this.$Message.warning("反馈问题")
      },
      showModalEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this.type = type

        let width = '480',
          button = [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }],
          opintions = [
            [{title:'原密码',id:'oldPassword',type:'passWord',titlespan:4,colspan:20,required:true}],
            [{title:'新密码',id:'password',type:'passWord',titlespan:4,colspan:20,required:true}],
            [{title:'确认密码',id:'confirmPsw',type:'passWord',titlespan:4,colspan:20,required:true}]]

        if(type == 1) {
          width = '768'
          button = []
          opintions = [
            [{title:'公司名称',id:'name',type:'input',titlespan:3,colspan:9,readonly: true},
              {title:'公司账号',id:'account',type:'input',titlespan:3,colspan:9,readonly: true}
            ],
            [{title:'管理员',id:'manage',type:'input',titlespan:3,colspan:9,readonly: true},
              {title:'邮箱',id:'email',type:'input',titlespan:3,colspan:9,readonly: true}
            ],
            [{title:'手机',id:'phone',type:'input',titlespan:3,colspan:9,readonly: true},
              {title:'注册时间',id:'registerTime',type:'input',titlespan:3,colspan:9,readonly: true}
            ],
            [{title:'注册/授权数',id:'register',type:'input',titlespan:3,colspan:9,readonly: true},
              {title:'到期时间',id:'date',type:'input',titlespan:3,colspan:9,readonly: true}
            ],
            [{title:'备注',id:'content',type:'textarea',titlespan:3,colspan:21,readonly: true}
            ]
          ]
        }
        this.inputForm.option = {
          title: type == 1 ? '企业信息' : '修改密码',
          cancelText: '取消',
          width: width,
          opintions: opintions,
          button: button
        }
        if(type == 0) {
          this.inputForm.value = {
            oldPassword: '',
            password: '',
            confirmPsw: ''
          }
        }
        if(type == 1) {
          this.inputForm.option.cancelText = '关闭'
          //this.inputForm.value.id = row.id
        }
      },
      getInputVal (val, type) {
        this.inputForm.value = val
        if (type === 'cancel') {
          this.inputForm.modalshow = false
          return
        }
        let newVal = {}
        Object.assign(newVal, val)
        console.log("----------" + JSON.stringify(newVal))
        if(this.type == 0){
          this.updatePsw(newVal)
        }else {

        }
      },
      updatePsw (data) {
        if(data.password != data.confirmPsw) {
          this.$Message.warning("新密码输入不一致")
          return
        }
        this.inputForm.modalDisabled = true
        this.requestAjax('post', 'updatePwd', {id: this.userData.user.id,passWord: data.oldPassword, newPassWord: data.password}).then(res => {
          if(res.success) {
            this.inputForm.modalshow = false
            this.$Message.success(res.desc)
          }else {
            this.inputForm.modalDisabled = false
            this.$Message.warning(res.desc)
          }
        }, errror => {
          this.inputForm.modalDisabled = false
        })
      },
      _initSystemDate(){
        setInterval(() => {
          this.systemDate = new Date().format('yyyy-MM-dd hh:mm:ss')
        },1000)
      },

      toggleMenuEvent(){
        this.toggleMenu = !this.toggleMenu
      }
    },
    components: {
      inputFrom
    }
  }
</script>

<style scoped>

  .wrapper-content{
    min-width: 1060px;
  }

  .app-header{
    width: 100%;
    height: 50px;
    box-shadow: 0 2px 20px 0 rgba(15,12,70,.1);
    line-height: 50px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .header-col{
    margin-right: 24px;
  }
  .app-content{
    padding: 50px 0 0 200px;

  }
  .cloud-left-menu{
    position: fixed;
    overflow: hidden;
    top: 0;
    bottom: 0;
    left: 0;
    width: 200px;
    z-index: 1000;
    background: #222430;
  }
  .footer{line-height: 36px;width: 100%; position: absolute; bottom: 0;left: 0; z-index: 1111}

  .user-pic-wrapper{
    height: 120px;
  }
  .user-pic-wrapper img{
    width: 140px;
  }

  .menu-wrapper{
    background: #222430;
  }

  .menu-wrapper{
    width: 200px!important;
  }

  .bezier{
    -webkit-transition: all 300ms cubic-bezier(0.000, 0.830, 0.485, 1); /* older webkit */
    -webkit-transition: all 300ms cubic-bezier(0.000, 0.830, 0.485, 1.035);
    -moz-transition: all 300ms cubic-bezier(0.000, 0.830, 0.485, 1.035);
    -o-transition: all 300ms cubic-bezier(0.000, 0.830, 0.485, 1.035);
    transition: all 300ms cubic-bezier(0.000, 0.830, 0.485, 1.035);

    -webkit-transition-timing-function: cubic-bezier(0.000, 0.830, 0.485, 1); /* older webkit */
    -webkit-transition-timing-function: cubic-bezier(0.000, 0.830, 0.485, 1.035);
    -moz-transition-timing-function: cubic-bezier(0.000, 0.830, 0.485, 1.035);
    -o-transition-timing-function: cubic-bezier(0.000, 0.830, 0.485, 1.035);
    transition-timing-function: cubic-bezier(0.000, 0.830, 0.485, 1.035);
  }
</style>
