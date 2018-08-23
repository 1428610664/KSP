<template>
  <div class="wrapper b wrapper-box">
    <div class="clear">
      <div class="c3 fl">
        <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
        <!--<Button type="primary">导入</Button>-->
        <Button type="primary" @click="addUserEvent(null, 0)">部门维护</Button>
      </div>
      <div class="fr c3">
        <span>所属部门：</span>
        <Select v-model="requestParam.department" style="width:160px">
          <Option v-for="item in departmentList" :value="item.value" :key="item.value">{{ item.label}}</Option>
        </Select>
        <Input v-model="requestParam.keyWord" placeholder="请输入客户名称..." style="width: 160px" />
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
                :modalshow="inputForm.modalshow">
      <template v-if="type == 0" slot="table">
        <div class="m-t10 m-b10 clear">
          <Button type="primary" @click="addDepartmentEvent">添加</Button>
        </div>
        <i-table class="m-t10" :columns="columnsModel" :data="dataModel" border size="small"></i-table>
      </template>
    </input-from>
  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'
  import utils from  'common/js/utils'

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

        rolesList: [],          // 角色列表
        departmentList: [],     // 部门列表

        requestParam: {
          department: '',
          keyWord: '',
          limit: 20,
          offset: 1,
          status: 1
        },
        data: [],
        total: 0,

        columns: [
          {title: '用户名', key: 'userName', width: 140, sortable: false, render: this.tdRender},
          {title: '姓名', key: 'name', width: 140, sortable: false, render: this.tdRender},
          {title: '所属部门', key: 'departmentName', width: 140, sortable: false, render: this.tdRender},
          {title: '手机', key: 'phone', width: 160, sortable: false, render: this.tdRender},
          {title: '电话', key: 'tel', width: 160, sortable: false, render: this.tdRender},
          {title: '邮箱', key: 'email', width: 150, sortable: false, render: this.tdRender},
          {title: '角色', key: 'roleName', width: 140, sortable: false, render: this.tdRender},
          {title: '备注', key: 'remark',minWidth: 200, sortable: false, render: this.tdRender},
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
                      console.log(JSON.stringify(params.row))
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
                        content: '确认删除用户【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteUser(params.row.id)
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
                      this.addUserEvent(params.row, 3)
                    }
                  }
                }, '重置密码')
              ])
            }
          }
        ],

        dataModel: [],
        columnsModel: [],

      }
    },
    created() {
      this.$nextTick(() => {
        this.requestRolesList()
        this.requestDepartmentList()
        this.requestData()
      })
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
        this.requestAjax('get', 'users', this.requestParam).then(res => {
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

        let vm = this,
          title = '',
          width = '768',
          button = [{
            type: 'primary',
            title: '修改',
            click: 'handle'
          }],
          opintions = [
            [{title:'用户名',id:'userName',type:'input',titlespan:3,colspan:9,required:true},
              {title:'密码',id:'passWord',type:'input',titlespan:3,colspan:9,required:true, readonly: type == 1}],
            [{title:'姓名',id:'name',type:'input',titlespan:3,colspan:9,required:true},
              {title:'所属部门',id:'department',type:'select-opts',titlespan:3,colspan:9,required:true, select: this.departmentList}],
            [{title:'手机',id:'phone',type:'input',titlespan:3,colspan:9,required:false},
              {title:'电话',id:'tel',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'邮箱',id:'email',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'用户角色',id:'role',type:'select-opts',titlespan:3,colspan:21,relation: '',required:true, select: this.rolesList}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:3,colspan:21,required:false}]]

        switch (type){
          case 0:
            title = '部门维护'
            opintions = []
            button = []
            this.columnsModel = [
              {
                title: '部门名称',
                key: 'name',
                align: 'center',
                render: (h, params) => {
                  return h('Input', {
                    props: {
                      value: params.row.name,
                    },
                    on: {
                      'on-change': (event) => {
                        params.row.name = event.target.value
                        vm.dataModel[params.index] = params.row
                      }
                    }
                  }, [])
                },
              },
              {title: '上级部门',
                align: 'center',
                render: (h, params) => {
                  let department = []
                  this.departmentList.forEach(item => {
                    if(params.row.id != item.value)
                    department.push(
                      h('Option',{
                        props: {
                          value: item.value
                        }
                      },item.label)
                    )
                  })
                  return h('Select', {
                      props:{
                        value: this.dataModel[params.index].pid,
                      },
                      on: {
                        'on-change':(event) => {
                          this.dataModel[params.index].pid = event
                        }
                      }
                    }, department)
                }
              },
              {title: '操作',
                width: 140,
                align: 'center',
                render: (h, params) => {
                  return h('div', [
                    h('Button', {
                      style: {marginRight: '5px'},
                      props: {type: 'success', size: 'small'},
                      nativeOn: {
                        click: () => {
                          console.log(JSON.stringify(this.dataModel[params.index]))
                          if(utils.isEmpty(this.dataModel[params.index].name)){
                            this.$Message.warning('请填写部门名称')
                            return
                          }
                          if(utils.isEmpty(this.dataModel[params.index].pid)){
                            this.$Message.warning('请选择上级部门')
                            return
                          }
                          this.updateDepartment({id: this.dataModel[params.index].id, pid: this.dataModel[params.index].pid, name: this.dataModel[params.index].name})
                        }
                      }
                    }, '保存'),
                    h('Button', {
                      style: {marginRight: '5px'},
                      props: {type: 'error', size: 'small'},
                      nativeOn: {
                        click: () => {
                          if(utils.isEmpty(this.dataModel[params.index].id)) {
                            this.dataModel.splice(params.index, 1)
                          }else {
                            this.deleteDepartment(this.dataModel[params.index].id)
                          }
                        }
                      }
                    }, '删除')
                  ])
                }
              }
            ]
            break
          case 1:
            title = '修改用户'
            break
          case 2:
            title = '新增用户'
            break
          case 3:
            title = '重置密码'
            width = '480'
            opintions = [
              [{title:'新密码',id:'newPsw',type:'passWord',titlespan:4,colspan:20,required:true}],
              [{title:'确认密码',id:'psw',type:'passWord',titlespan:4,colspan:20,required:true}]
            ]
            break
        }
        this.inputForm.option = {
          title: title,
          width: width,
          opintions: opintions,
          button:  button
        }
        if(type == 1 || type == 2){ // 新增 修改
          this.inputForm.value = {
            userName: row ? row.userName : '',
            passWord: row ? row.passWord : '',
            name: row ? row.name : '',
            department: row ? row.department : '',
            role: row ? row.role : '',
            email: row ? row.email : '',
            phone: row ? row.phone : '',
            tel: row ? row.tel : '',
            remark: row ? row.remark : ''
          }
        }else if(type == 3){  // 修改密码
          this.inputForm.value = {
            newPsw:  row ? row.newPsw : '',
            psw:  row ? row.psw : '',
          }
        }
        if(type == 1 || type == 3) {
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
        if(this.type == 0) {

        }else if(this.type == 3) {
          if(newVal.newPsw != newVal.psw){
            this.$Message.warning('密码输入不一致')
            return
          }
          this.updataUser({id: newVal.id, passWord: newVal.newPsw})
        }else{ // 修改、新增用户
          this.updataUser(newVal)
        }
      },

      addDepartmentEvent(){
        this.dataModel.push({id: '', pid: '', name: ''})
      },
      requestDepartmentList() {
        this.requestAjax('get', 'departmentList', {sort: 'createTime'}).then(res => {
          if(res.success) {
            let data =  res.data.rows, arr = [], arr2 = []
            data.forEach( (item, i) => {
              if(i > 0) arr.push(item)
              arr2.push({value: item.id, label: item.name})
            })
            this.dataModel = arr
            this.departmentList = arr2
          }
        })
      },
      updateDepartment(data){
        this.requestAjax('post', 'department', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestDepartmentList()
          }
        })
      },
      deleteDepartment(id) {
        this.requestAjax('delete', 'deleteDepartment', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestDepartmentList()
        })
      },

      deleteUser(id){
        this.requestAjax('delete', 'deleteUser', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      updataUser(data) {
        this.requestAjax('post', 'users', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      requestRolesList(){
        this.requestAjax('get', 'rolesList', {status: 1}).then(res => {
          if(res.success) {
            let data = []
            res.data.rows.forEach(item => {
              data.push({value: item.id, label: item.name})
            })
            this.rolesList = data
          }
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
