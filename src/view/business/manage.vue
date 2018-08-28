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
        <Input v-model="requestParam.keyWord" placeholder="请输入商业主题..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
        <!--<Button>高级查询</Button>-->
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <span class="" style="line-height: 30px">跟踪金额汇总（元）：<span class="c1 fz14">{{price}}</span></span>
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
        propsKey: 'business', // 自定义字段请求key值
        price: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },

        userList: [],       // 负责人
        customerList: [],   // 客户名称
        winRate: [],        // 赢率
        productList: [],    // 产品

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
          {title: '商机主题',show: true, key: 'name', width: 160, sortable: true, render: this.tdRender},
          {title: '客户名称',show: true, key: 'customerName', width: 140, sortable: true, render: this.tdRender},
          {title: '客户联系人',show: true, key: 'contactName', width: 140, sortable: true, render: this.tdRender},
          {title: '跟踪金额',show: true, key: 'price', width: 140, sortable: true, render: this.tdRender},
          {title: '赢率',show: true, key: 'winRate', width: 120, sortable: true, render: this.tdRender},
          {title: '产品',show: true, key: 'productName', width: 160, sortable: true, render: this.tdRender},
          {title: '预计下单日期',show: true, key: 'orderDate', width: 160, sortable: true, render: this.tdRender},
          {title: '客户需求描述',show: true, key: 'descs', width: 220, sortable: true, render: this.tdRender},
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
                        content: '确认删除商业机会【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteBusiness(params.row.id)
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
        this.requestCommon({queryEnums: true,queryUsers: true,queryCustomer: true,queryProduct: true}, (res)=> {
          if(res.success) {
            let enums = this._parseEnums(res.data.enums)
            this.userList= res.data.users
            this.customerList = res.data.customers
            this.productList = res.data.products
            this.winRate = enums[this.__ENUMS_KEY__.winRate]
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'businessList', this.requestParam).then(res => {
          if(res.success) {
            this.price = res.data.price
            this.data = res.data.rows
            this.total = res.data.rows.length
          }
        })
      },
      updateBusiness(data){
        this.requestAjax('post', 'business', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteBusiness(id) {
        this.requestAjax('delete', 'deleteBusiness', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this._clearPropsFromVal()

        this.inputForm.option = {
          title: type == 1 ? '修改商业机会' : '新增商业机会',
          width: '768',
          opintions: [
            [{title:'商机主题',id:'name',type:'input',titlespan:4,colspan:20,required:true}],
            [{link: true,linkOpts: [{title:'客户名称',id:'customerId',type:'select-opts', filterable: true,titlespan:4,colspan:8,required:true, url: 'customerList'},
                {title:'客户联系人',id: 'contact',type:'select-opts',titlespan:4,colspan:8,required:true, url: 'contactList',parmsId: 'customerId'}]}],
            [{title:'跟踪金额(元)',id:'price',type:'InputNumber',min: 0,titlespan:4,colspan:8,required:true},
              {title:'赢率',id:'winRate',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true, select: this.winRate}],
            [{title:'产品',id:'product',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true, select: this.productList},
              {title:'预计下单日期',id:'orderDate',type:'time',format: 'yyyy-MM-dd',titlespan:4,colspan:8,required:true}],
            [{title:'客户需求描述',id:'descs',type:'textarea',titlespan:4,colspan:20,required:false}],
            [{title:'负责人',id:'principal',type:'select-opts',titlespan:4,colspan:20, filterable: true,relation: '',required:true, select: this.userList}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:4,colspan:20,required:false}]],
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = {
          name: row ? row.name : '',
          customerId: row ? row.customerId : '',
          contact: row ? type == 1 ? row.contactId: row.contact : '',
          price: row ? row.price : '',
          winRate: row ? row.winRate : '10%',
          product: row ? row.product : '',
          orderDate: row ? row.orderDate : '',
          descs: row ? row.descs : '',
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
        newVal.propsVal = JSON.stringify(this.propsFromVal)
        this.updateBusiness(newVal)
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
