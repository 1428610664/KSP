<template>
  <div class="wrapper b wrapper-box">
    <div class="clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <div class="fr c3">
        <Input v-model="requestParam.keyWord" placeholder="请输入角色名称..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
    </div>

    <!--table列表-->
    <i-table class="m-t10" :columns="columns" :data="data" border size="small" ref="table"></i-table>
    <!--分页-->
    <div style="text-align: right; padding-top: 5px;">
      <Page show-total show-sizer show-elevator style="display: inline-block;" placement="top"
            :total="total"
            :page-size="requestParam.limit"
            :current="requestParam.offset"
            @on-change="changePage"
            @on-page-size-change="changeSize"></Page>
    </div>

    <input-from v-if="inputForm.show" @changeOptions="getInputVal" :options="inputForm.option" :value="inputForm.value" :modalDisabled="inputForm.modalDisabled"
                :modalshow="inputForm.modalshow"/>

  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'

  export default {
    name: "index",
    data() {
      return {
        type: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },

        menusList: [],    // 菜单集合
        pIds: {},         // 父级菜单ID集合

        requestParam: {
          keyWord: '',
          limit: 20,
          offset: 1
        },
        data: [],
        total: 0,

        columns: [
          {title: '角色名称', key: 'name', width: 160, sortable: false, render: this.tdRender},
          {title: '创建时间', sortable: false, render: (h, params) => {
              return h('div', [
                h('span', new Date(params.row.createTime.time).format('yyyy-MM-dd hh:mm:ss'))
              ])
            }},
          {title: '创建者', key: 'userName', width: 160, sortable: false, render: this.tdRender},
          {title: '状态', width: 120, sortable: false, render: (h, params) => {
              return h('div', [
                h('span', params.row.status == 0 ? "禁用": "启用")
              ])
            }},
          {title: '操作',
            width: 220,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.addUserEvent(params.row, 1)
                    }
                  }
                }, '修改'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确认删除角色【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteRoles(params.row.id)
                        }
                      })

                    }
                  }
                }, '删除'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.requestMenusByRoleId(params.row)
                    }
                  }
                }, '角色资源')
              ])
            }
          }
        ]
      }
    },
    created() {
      setTimeout(() => {
        this.requestData()
        this.requestMenus()
      }, 20)
    },
    methods: {
      searchEvent(){
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        this.requestData()
      },
      changePage (v) {
        this.requestParam.offset = v
        this.requestData()
      },
      changeSize (v) {
        this.requestParam.limit = v
        this.requestData()
      },
      requestData() {
        this.requestAjax('get', 'roles', this.requestParam).then(res => {
          if(res.success) {
            this.data = res.data.rows
            this.total = res.data.total
          }
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this.type = type

        let opintions = [
          [{title:'角色名称',id:'name',type:'input',titlespan:4,colspan:20,required:true}],
          [{title:'状态',id:'status',type:'radio',titlespan:4,colspan:20,required:true}]]
        if(type == 0) {
          opintions = [
            [{title:'角色名称',id:'name',type:'input',titlespan:4,colspan:20,required:true,readonly: true}]
          ]
          opintions = opintions.concat(this._parseOptions(this.menusList))
        }

        this.inputForm.option = {
          title: type == 0 ? '角色资源' : type == 1 ? '修改角色' : '新增角色',
          width: '480',
          opintions: opintions,
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        if(type == 0) {
          this.inputForm.value = {
            name: row ? row.name : ''
          }
          this.inputForm.value = Object.assign({},this.inputForm.value, this.pIds)
        }else {
          this.inputForm.value = {
            name: row ? row.name : '',
            status: row ? row.status+'' : ''
          }
        }
        if(type == 0 || type == 1) {
          this.inputForm.value.id = row.id
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
        delete newVal.name
        if(this.type == 0) { // 角色资源
          let parms = {id : newVal.id}, menuIds = []
          for(let k in newVal){
            if(k != 'id') menuIds = menuIds.concat(newVal[k])
          }
          parms.menuIds = menuIds.join(',')
          this.upSavaMenus(parms)
        }else { // 修改、新增角色
          this.updateRoles(newVal)
        }
      },
      updateRoles(data) {
        this.requestAjax('post', 'roles', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        }, error => {
          this.$Message.warning('操作失败')
          this.inputForm.modalshow = true
        })
      },
      deleteRoles(id) {
        this.requestAjax('delete', 'deleteRoles', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success)
            this.requestData()
        })
      },
      requestMenus() {
        this.requestAjax('get', 'menusList', {}).then(res => {
          if(res.success) {
            let menus = this._parseMenus(res.data.rows)
            this.menusList = menus.menusList
            this.pIds = menus.pIds
          }
        })
      },
      upSavaMenus(data){
        this.requestAjax('post', 'savaMenus', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success){
            this.inputForm.modalshow = false
            this.requestData()
          }
        })
      },

      requestMenusByRoleId(row){
        const loading = this.$Message.loading({content: '加载中...',duration: 0})
        this.requestAjax('get', 'menusByRoleId', {roleId: row.id}).then(res => {
          if(res.success) {
            setTimeout(() => {
              loading()
              this.pIds = this._parseMenusIds(res.data.rows)
              this.addUserEvent(row, 0)
            }, 200)
          }else{
            loading()
            this.$Message.warning('加载失败')
          }
        }, () => {
          loading()
        })
      },

      _parseMenus(data){
        let menusList = [], pIds = {}
        data.forEach(item => {
          if(item.parentId == '-'){
            let _i = this._findIndex(menusList, item.id)
            if( _i == -1) {
              menusList.push({value: item.id, lable: item.name, childer: []})
            }else{
              menusList[_i].lable = item.name
            }
            pIds[item.id] = []
          }else{
            let _i = this._findIndex(menusList, item.parentId)
            if( _i == -1) {
              menusList.push({value: item.parentId, lable: item.name, childer: [{value: item.id, name: item.name}]})
            }else{
              menusList[_i].childer.push({value: item.id, name: item.name})
            }
          }
        })
        return {pIds, menusList}
      },
      _parseMenusIds(data){
        let pIds = {}
        data.forEach(item => {
          if(item.parentId == '-'){
            pIds[item.id] = []
          }else{
            if(pIds[item.parentId]) {
              if(item.selected == 'true') pIds[item.parentId].push(item.id)
            }else{
              if(item.selected == 'true') pIds[item.parentId] = [item.id]
            }
          }
        })
        return pIds
      },
      _findIndex(data, id){
        return data.findIndex(item => {
          return item.value == id
        })
      },
      _parseOptions(data){
        let options = []
        data.forEach(item => {
          options.push([{title: item.lable,id: item.value,type:'checkbox',titlespan:4,colspan:20,required: false, checkboxes: item.childer}])
        })
        return options
      }
    },
    components: {
      inputFrom
    }
  }
</script>

<style scoped>

  .wrapper{
    margin: 10px;
  }

</style>
