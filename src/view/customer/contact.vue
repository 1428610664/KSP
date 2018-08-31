<template>
  <div class="wrapper b wrapper-box">
    <div class="clear">
      <div class="fr c3">
        <span>负责人：</span>
        <Select v-model="principal" :multiple="true" :filterable="true" style="width:240px">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span class="m-l5">客户名称：</span>
        <Select v-model="requestParam.customerId" :filterable="true" style="width:160px">
          <Option v-for="item in customerList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Input v-model="requestParam.keyWord" placeholder="请输入联系人名称..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
        <!--<Button @click="addUserEvent(null, 0)">高级查询</Button>-->
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <!--<Button type="primary">导入</Button>-->
      <!--<Button type="primary">导出</Button>-->
      <table-columns class="fr" :columns="columns" @change="columnsChange"></table-columns>
    </div>

    <!--table列表-->
    <i-table class="m-t10" :columns="changeColumns" :data="data" border size="small" ref="table"></i-table>
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
      <template slot="custom">
        <div v-for="(row ,index) in propsOpintions" :key="index" class="customForm">
          <Row :gutter=5>
            <div  v-for="rows in row" :key="rows.title">
              <div v-if="rows.theme" class="m-t10 m-b10">
                <h3 class="c2" style="font-weight: bold" :style="{textAlign: rows.align ? rows.align: 'left'}">{{rows.title}}</h3>
              </div>
              <div v-else>
                <i-col :span="rows.titlespan">
                  <p class="width-right m-l10"><span class="red_tip">{{rows.required ? '*' : ''}}</span>{{rows.title}}</p>
                </i-col>
                <i-col :span="rows.colspan">
                  <i-input type="text" v-if="rows.type=='input'"
                           :placeholder="rows.readonly ? '' : rows.required ? '请输入...(必填）':'请输入...'"
                           v-model="propsFromVal[rows.id]"
                           :disabled="rows.disabled"
                           :readonly="rows.readonly"
                           :maxlength="rows.maxLength!=undefined ? rows.maxLength: 50"></i-input>
                </i-col>
              </div>
            </div>

          </Row>
        </div>
      </template>
    </input-from>

  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'
  import tableColumns from 'components/table-columns'
  import {mapGetters} from 'vuex'
  import { propsMixin } from 'mixins/propsMixin'

  export default {
    mixins: [propsMixin],
    data() {
      return {
        type: 0,
        propsKey: 'contact', // 自定义字段请求key值

        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        principal: [],
        requestParam: {
          principal: '',
          customerId: '',
          keyWord: '',
          limit: 20,
          offset: 1
        },

        contactList: [],    // 上级联系人
        userList: [],       // 负责人
        customerList: [],   // 客户名称
        departmentList: [], // 部门
        roleList: [],       // 决策角色
        levelList: [],      // 关系等级

        data: [],
        total: 0,

        columns: [
          // {title: '编号', key: 'id', width: 170, sortable: true},
          {title: '姓名',show: true, key: 'name', width: 140, sortable: true, render: this.tdRender},
          {title: '客户名称',show: true, key: 'customerName', width: 160, sortable: true, render: this.tdRender},
          {title: '性别',show: true, key: 'sex', width: 120, sortable: true},
          {title: '部门',show: true, key: 'departmentName', width: 140, sortable: true, render: this.tdRender},
          {title: '职位',show: true, key: 'officer', width: 120, sortable: true, render: this.tdRender},
          {title: '决策角色',show: true, key: 'role', width: 120, sortable: true, render: this.tdRender},
          {title: '关系等级',show: true, key: 'level', width: 120, sortable: true, render: this.tdRender},
          {title: '手机',show: true, key: 'phone', width: 160, sortable: true, render: this.tdRender},
          {title: '电话',show: true, key: 'tel', width: 160, sortable: true, render: this.tdRender},
          {title: 'Email',show: true, key: 'email', width: 160, sortable: true, render: this.tdRender},
          {title: 'QQ',show: true, key: 'qq', width: 140, sortable: true, render: this.tdRender},
          {title: '负责人',show: true, key: 'principalName', width: 140, sortable: true},
          {title: '负责部门',show: true, key: 'principalDepartmentName', width: 140, sortable: true},
          {title: '操作',show: true,
            width: 140,
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
                        content: '确认删除联系人【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteContact(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除')
              ])
            }
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    created() {
      this.$nextTick(() => {
        this.requestProps()
        this.requestData()
        this.requestCommons()
      })
    },
    methods: {
      searchEvent() {
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        this.requestParam.principal = this.principal.join(',')
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
      requestCommons(){
        this.requestCommon({queryEnums: true,queryUsers: true,queryCustomer: true,queryDepartment: true}, (res)=> {
          if(res.success) {
            let enums = this._parseEnums(res.data.enums)
            this.userList= res.data.users
            this.departmentList = res.data.departments
            this.customerList = res.data.customers
            this.roleList = enums[this.__ENUMS_KEY__.role]
            this.levelList = this._parseSelectData3(enums[this.__ENUMS_KEY__.level])
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'contact', this.requestParam).then(res => {
          if(res.success) {
            this.data = res.data.rows
            this.total = res.data.rows.length
            this.contactList = this._parseSelectData(res.data.rows)
          }
        })
      },
      updateContact(data){
        this.requestAjax('post', 'contact', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteContact(id) {
        this.requestAjax('delete', 'deleteContact', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this.type = type
        this._clearPropsFromVal()

        let opintions = [
            [{title:'姓名',id:'name',type:'input',titlespan:3,colspan:9,required:true},
              {title:'性别',id:'sex',type:'select',titlespan:3,colspan:9,required:false}],
          [{link: true,linkOpts: [{title:'客户名称',id:'customerId',type:'select-opts', titlespan:3,colspan:9,required:true, url: 'customerList'},
              {title:'上级联系人',id: 'superiors',type:'select-opts',titlespan:3,colspan:9,required: false, url: 'contactList',parmsId: 'customerId'}]}],
            [{title:'部门',id:'departmentId',type:'select-opts',titlespan:3,colspan:9,relation: '',required:false, select: this.departmentList},
              {title:'职位',id:'officer',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'决策角色',id:'role',type:'select-opts',titlespan:3,colspan:9,relation: '',required:false, select: this.roleList},
              {title:'关系等级',id:'level',type:'select-opts',titlespan:3,colspan:9,relation: '',required:false, select: this.levelList}],
            [{title:'手机',id:'phone',type:'input',titlespan:3,colspan:9,required:false},
              {title:'电话',id:'tel',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'Email',id:'email',type:'input',titlespan:3,colspan:9,required:false},
              {title:'QQ',id:'qq',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'籍贯',id:'hometown',type:'input',titlespan:3,colspan:9,required:false},
              {title:'负责人',id:'principal',type:'select-opts',titlespan:3,colspan:9, relation: '',required:false, select: this.userList}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:3,colspan:21,required:false}]]

        this.inputForm.option = {
          title: type == 0 ? '高级查询' : type == 1 ? '修改联系人' : '新增联系人',
          width: '768',
          opintions: opintions,
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = {
          name: row ? row.name : '',
          customerId: row ? row.customerId : '',
          sex: row ? row.sex : '',
          hometown: row ? row.hometown : '',
          departmentId: row ? row.departmentId : '',
          officer: row ? row.officer : '',
          role: row ? row.role : '',
          level: row ? row.level : '',
          phone: row ? row.phone : '',
          tel: row ? row.tel : '',
          email: row ? row.email : '',
          qq: row ? row.qq : '',
          superiors: row ? row.superiors : '',
          principal: row ? row.principal : this.userId,
          remark: row ? row.remark : ''
        }
        if(type == 1) {
          if(row.propsVal) this._setPropsVal(JSON.parse(row.propsVal))
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
        if(this.type == 1 || this.type == 2) {
          newVal.propsVal = JSON.stringify(this.propsFromVal)
          this.updateContact(newVal)
        }else{
          this.inputForm.modalshow = false
        }
      }
    },
    components: {
      inputFrom,
      tableColumns
    }
  }
</script>

<style scoped>

  .wrapper{
    margin: 10px;
  }

</style>
