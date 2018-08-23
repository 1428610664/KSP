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
    <i-table class="m-t10" :columns="columns" :data="data" border size="small" ref="table" @on-row-dblclick="rowDbClick"></i-table>
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
                      this.addUserEvent(params.row, 0)
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
      }, 20)
    },
    methods: {
      searchEvent(){
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        this.requestData()
      },
      /**
       *跳页
       * @param v
       */
      changePage (v) {
        this.requestParam.offset = v
        this.requestData()
      },
      /**
       *改变页面展示用户条数
       * @param v
       */
      changeSize (v) {
        this.requestParam.limit = v
        this.requestData()
      },
      /**
       *双击表格列时触发
       */
      rowDbClick (row) {
        this.$Message.success('双击')
      },
      requestData() {
        this.requestAjax('get', 'rolesList', this.requestParam).then(res => {
          if(res.success) {
            this.data = res.data.rows
            this.total = res.data.rows.length
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
            [{title:'角色名称',id:'name',type:'input',titlespan:4,colspan:20,required:true,readonly: true}],
            [{title:'xx主菜单',id:'menu',type:'checkbox',titlespan:4,colspan:20,required:true, checkboxes: [{value: '子菜单1', name: '1'},{value: '子菜单2', name: '2'},{value: '子菜单3', name: '3'}]}]
          ]
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
            name: row ? row.name : '',
            menu: []
          }
        }else {
          this.inputForm.value = {
            name: row ? row.name : '',
            status: row ? row.status+'' : ''
          }
        }
        if(type == 1) {
          this.inputForm.value.id = row.id
        }
      },
      /**
       *提交返回处理方法
       * @param val
       * @param type
       */
      getInputVal (val, type) {
        this.inputForm.value = val // 表单填写的内容;
        if (type === 'cancel') { // 按钮操作
          this.inputForm.modalshow = false // 隐藏modal
          return
        }
        let newVal = {}
        Object.assign(newVal, val)
        if(this.type == 0) { // 角色资源

        }else { // 修改、新增角色
          this.updateRoles(newVal)
        }
      },
      updateRoles(data) {
        this.requestAjax('post', 'roles', data).then(res => {
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
            this.$Message.success(res.desc)
          }else {
            this.$Message.warning(res.desc)
            this.inputForm.modalshow = true
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
