<template>
  <div class="m-10 b wrapper-box">
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
        <Input v-model="requestParam.keyWord" placeholder="请输入活动主题..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <!--<Button type="primary">导入</Button>-->
      <span class="" style="line-height: 30px">实际费用汇总（元）：<span class="c1 fz14">{{priceActual}}</span></span>
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

    <input-from v-if="inputForm.show" @changeOptions="getInputVal" @customerChange="customerChange" :options="inputForm.option" :value="inputForm.value" :modalDisabled="inputForm.modalDisabled"
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
    name: "index",
    mixins: [propsMixin],
    data() {
      return {
        type: 0,
        propsKey: 'activity', // 自定义字段请求key值
        priceActual: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },

        userList: [],       // 负责人
        customerList: [],   // 客户名称
        activityMode: [],   // 活动方式
        business: [],       // 所属商机
        business2: [],      // 弹窗所属商机

        principal: [],
        requestParam: {
          principal: '',
          customerId: '',
          keyWord: '',
          limit: 20,
          offset: 1
        },
        data: [],
        total: 0,

        columns: [
          // {title: '编号', key: 'id', width: 170, sortable: true},
          {title: '活动状态',show: true, width: 120, sortable: true, render: (h, params) => {
              return h('div', [
                h('span', this.getActiveStatus(params.row.status ))
              ])
            }},
          {title: '活动主题',show: true, key: 'name', width: 160, sortable: true, render: this.tdRender},
          {title: '客户名称',show: true, key: 'customerName', width: 140, sortable: true, render: this.tdRender},
          {title: '客户联系人',show: true, key: 'contactName', width: 140, sortable: true, render: this.tdRender},
          {title: '所属商机',show: true, key: 'businessName', width: 160, sortable: true, render: this.tdRender},
          {title: '活动方式',show: true, key: 'way', width: 120, sortable: true, render: this.tdRender},
          {title: '计划开始时间',show: true, width: 170, sortable: true, render: (h, params) => {
              return h('div', [
                h('span', params.row.btPlan ? new Date(params.row.btPlan.time).format('yyyy-MM-dd hh:mm:ss') : '')
              ])
            }},
          {title: '实际开始时间',show: true, width: 170, sortable: true, render: (h, params) => {
              return h('div', [
                h('span', params.row.btPlan ? new Date(params.row.etPlan.time).format('yyyy-MM-dd hh:mm:ss') : '')
              ])
            }},
          {title: '预计费用',show: true, key: 'pricePlan', width: 120, sortable: true, render: this.tdRender},
          {title: '实际费用',show: true, key: 'priceActual', width: 120, sortable: true, render: this.tdRender},
          {title: '负责人',show: true, key: 'principalName', width: 140, sortable: true, render: this.tdRender},
          {title: '操作',show: true,
            width: 220,
            align: 'center',
            render: (h, params) => {
              let status = params.row.status,
                b1 = h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.addUserEvent(params.row, 1)
                    }
                  }
                }, '修改'),
                b2 = h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '提示',
                        content: '确认删除活动【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteActivity(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除'),
                b3 = h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'info', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.addUserEvent(params.row, 0)
                    }
                  }
                }, '结果填报')
              // 活动状态【1：未开始】【2：进行中】【99：结束】
              return h('div', [b1,b2,b3])
              if(status == 1){
                return h('div', [b1,b2])
              }else if(status == 2){
                return h('div', [b3])
              }
              return h('div', [])
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
        this.requestCommons()
        this.requestData()
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
        this.requestCommon({queryEnums: true,queryUsers: true,queryCustomer: true,queryBusiness: true}, (res)=> {
          if(res.success) {
            let enums = this._parseEnums(res.data.enums)
            this.userList= res.data.users
            this.customerList = res.data.customers
            this.business = res.data.business
            this.activityMode = enums[this.__ENUMS_KEY__.activityMode]
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'activity', this.requestParam).then(res => {
          if(res.success) {
            this.priceActual = res.data.priceActual
            this.data = res.data.rows
            this.total = res.data.rows.length
          }
        })
      },
      updateActivity(data){
        this.requestAjax('post', 'activity', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteActivity(id) {
        this.requestAjax('delete', 'deleteActivity', {}, id).then(res => {
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
          [{title:'活动主题',id:'name',type:'input',titlespan:4,colspan:20,required:true,readonly: type == 0}],
            [{link: true,linkOpts: [{title:'客户名称',id:'customerId',type:'select-opts', titlespan:4,colspan:8,required:true, change: 'customerChange',disabled: type == 0, url: 'customerList'},
                {title:'客户联系人',id:'contactId',type:'select-opts',titlespan:4,colspan:8,required:true,disabled: type == 0, url: 'contactList',parmsId: 'customerId'}]}],
          [{title:'所属商机',id:'businessId',type:'select-opts',titlespan:4,colspan:8,relation: '',required:false,disabled: type == 0, select: this.business},
            {title:'活动方式',id:'way',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true,disabled: type == 0, select: this.activityMode}],
          [{title:'计划开始时间',id:'btPlan',maxDate: 'etPlan', minDate: '',type:'time',titlespan:4,colspan:8,required:true,disabled: type == 0},
            {title:'计划结束时间',id:'etPlan',maxDate: '', minDate: 'btPlan',type:'time',titlespan:4,colspan:8,required:true,disabled: type == 0}],
          [{title:'预计费用',id:'pricePlan',type:'InputNumber',min: 0,titlespan:4,colspan:8,required:false,readonly: type == 0},
            {title:'费用说明',id:'priceDescPlan',type:'input',titlespan:4,colspan:8,required:false,readonly: type == 0}],
          [{title:'计划描述',id:'descsPlan',type:'textarea',titlespan:4,colspan:20,required:false,readonly: type == 0}],
          [{title:'销售支持',id:'sales',type:'input',titlespan:4,colspan:8,relation: '',required:false,readonly: type == 0},
            {title:'负责人',id:'principal',type:'select-opts',titlespan:4,colspan:8,relation: '', required:true,disabled: type == 0, select: this.userList}]],
          value = {
            name: row ? row.name : '',
            customerId: row ? row.customerId : '',
            contactId: row ? row.contactId : '',
            businessId: row ? row.businessId : '',
            way: row ? row.way : '',
            btPlan: row && row.btPlan ? new Date(row.btPlan.time).format('yyyy-MM-dd hh:mm:ss') : '',
            etPlan: row && row.etPlan ? new Date(row.etPlan.time).format('yyyy-MM-dd hh:mm:ss') : '',
            pricePlan: row ? row.pricePlan : 0,
            priceDescPlan: row ? row.priceDescPlan : '',
            descsPlan: row ? row.descsPlan : '',
            sales: row ? row.sales : '',
            principal: row ? row.principal : this.userId
          }

        if(type == 0) {
          opintions = opintions.concat([
            [{title:'活动结果',theme: true}],
            [{title:'实际开始时间',id:'btActual',maxDate: 'etActual', minDate: '',type:'time',titlespan:4,colspan:8,required:true},
              {title:'实际结束时间',id:'etActual',maxDate: '', minDate: 'btActual',type:'time',titlespan:4,colspan:8,required:true}],
            [{title:'实际费用',id:'priceActual',type:'InputNumber',min: 0,titlespan:4,colspan:8,required:false},
              {title:'费用说明',id:'priceDescActual',type:'input',titlespan:4,colspan:8,required:false}],
            [{title:'结果描述',id:'descsResult',type:'textarea',titlespan:4,colspan:20,required:true}],
          ])
          Object.assign(value, {
            btActual: row && row.btActual ? new Date(row.btActual.time).format('yyyy-MM-dd hh:mm:ss') : '',
            etActual: row && row.etActual ? new Date(row.etActual.time).format('yyyy-MM-dd hh:mm:ss') : '',
            priceActual: row ? row.priceActual : '',
            priceDescActual: row ? row.priceDescActual : '',
            descsResult: row ? row.descsResult : ''
          })
        }

        this.inputForm.option = {
          title: type == 0 ? '填报结果' : type == 1 ? '修改活动计划' : '新增活动申请',
          width: '768',
          opintions: opintions,
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = value
        if(type == 0 || type == 1) {
          if(row.propsVal) this._setPropsVal(JSON.parse(row.propsVal))
          // if(value.customerId) this.customerChange(value.customerId)
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
        if(this.type > 0){
          newVal.propsVal = JSON.stringify(this.propsFromVal)
          this.updateActivity(newVal)
        }else {
          let parms = {
            id: newVal.id,
            btActual: newVal.btActual,
            etActual: newVal.etActual,
            priceActual: newVal.priceActual,
            priceDescActual: newVal.priceDescActual,
            descsResult: newVal.descsResult
          }
          this.updateActivity(newVal)
        }
      },
      customerChange(id){
        /*if(!id) return
        this.requestAjax('get', 'businessList', {customerId: id}).then(res => {
          let _i = this._findIndex('businessId')
          this.inputForm.option.opintions[_i][0].select = this._parseSelectData(res.data.rows)
        })*/
      },
      _findIndex(id){
        let opintions = this.inputForm.option.opintions
        return opintions.findIndex(item => {
          let mark = false
          item.forEach(d => {
            if(d.id == id) mark = true
          })
          return mark
        })
      }
    },
    components: {
      inputFrom,
      tableColumns
    }
  }
</script>

<style scoped>

</style>
