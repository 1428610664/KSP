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
        <Input v-model="requestParam.keyWord" placeholder="请输入收款主题..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <!--<Button type="primary">导入</Button>-->
      <span class="" style="line-height: 30px">收款金额汇总（元）：<span class="c1 fz14">{{price}}</span></span>
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

    <input-from v-if="inputForm.show" @changeOptions="getInputVal" @orderChange="orderChange" :options="inputForm.option" :value="inputForm.value" :modalDisabled="inputForm.modalDisabled"
                :modalshow="inputForm.modalshow">
      <template slot="table">
        <div class="m-t10 m-b10 clear">
          <h3 class="c2 fl" style="font-weight: bold">产品明细</h3>
        </div>
        <i-table class="m-t10" :columns="columnsModel" :data="dataModel" border size="small"></i-table>
      </template>
    </input-from>
  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'
  import {mapGetters} from 'vuex'

  export default {
    name: "index",
    data() {
      return {
        price: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        dataModel: [],
        columnsModel: [],

        userList: [],       // 负责人
        customerList: [],   // 客户名称
        orders: [],         // 订单
        paymentMode: [],    // 收款方式

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
          {title: '收款主题', key: 'name', width: 160, sortable: true, render: this.tdRender},
          {title: '客户名称', key: 'customerName', width: 150, sortable: true, render: this.tdRender},
          {title: '客户联系人', key: 'contactName', width: 140, sortable: true, render: this.tdRender},
          {title: '所属订单', key: 'ordersName', width: 150, sortable: true, render: this.tdRender},
          {title: '收款金额', key: 'price', width: 140, sortable: true},
          {title: '收款方式', key: 'way', width: 140, sortable: true, render: this.tdRender},
          {title: '收款日期', key: 'h', width: 160, sortable: true, render: (h, params) => {
                return h('div', [
                h('span', params.row.dates ? new Date(params.row.dates.time).format('yyyy-MM-dd hh:mm:ss') : '')
              ])
          }},
          {title: '毛利', key: 'gm', width: 120, sortable: true, render: this.tdRender},
          {title: '负责人', key: 'principalName', width: 140, sortable: true, render: this.tdRender},
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
                        content: '确认删除收款主题【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteReceipt(params.row.id)
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
        this.requestCommon({queryEnums: true,queryUsers: true,queryCustomer: true, queryOrders: true}, (res)=> {
          if(res.success) {
            let enums = this._parseEnums(res.data.enums)
            this.userList= res.data.users
            this.customerList = res.data.customers
            this.paymentMode = enums[this.__ENUMS_KEY__.payment]
            this.orders = res.data.orders
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'receipt', this.requestParam).then(res => {
          if(res.success) {
            this.price = res.data.price
            this.data = res.data.rows
            this.total = res.data.rows.length
          }
        })
      },
      updateReceipt(data){
        Object.assign(data, {productJson: JSON.stringify(this.dataModel)})
        this.requestAjax('post', 'receipt', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteReceipt(id) {
        this.requestAjax('delete', 'deleteReceipt', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this.dataModel = []

        this.inputForm.option = {
          title: type == 1 ? '修改收款' : '新增收款',
          width: '768',
          opintions: [
            [{title:'收款主题',id:'name',type:'input',titlespan:4,colspan:20,required:true}],
            [{title:'所属订单',id:'ordersId',type:'select-opts', filterable: true,titlespan:4,colspan:8,relation: '',required:true, select: this.orders, change: 'orderChange'},
              {title:'收款方式',id:'way',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true, select: this.paymentMode}],
            [{title:'收款金额(元)',id:'price',type:'InputNumber',min: 0,titlespan:4,colspan:8,required:true},
              {title:'收款日期',id:'dates',type:'time',titlespan:4,colspan:8,required:true}],
            [{link: true,linkOpts: [{title:'客户名称',id:'customerId',type:'select-opts',titlespan:4,colspan:8,required:true, url: 'customerList'},
                {title:'客户联系人',id:'contactId',type:'select-opts',titlespan:4,colspan:8,required:true, url: 'contactList',parmsId: 'customerId'}]}],
            [{title:'毛利(元)',id:'gm',type:'InputNumber',min: 0,titlespan:4,colspan:8,relation: '',required:false},
              {title:'负责人',id:'principal',type:'select-opts', filterable: true,titlespan:4,colspan:8,relation: '',required:true, select: this.userList}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:4,colspan:20,required:false}]],
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = {
          name: row ? row.name : '',
          ordersId: row ? row.ordersId : '',
          way: row ? row.way : '',
          price: row ? row.price : 0,
          dates: row && row.dates ? new Date(row.dates.time).format('yyyy-MM-dd hh:mm:ss') : '',
          customerId: row ? row.customerId : '',
          contactId: row ? row.contactId : '',
          gm: row ? row.gm : 0,
          principal: row ? row.principal : this.userId,
          remark: row ? row.remark : '',
        }

        // 产品毛利明细
        let vm = this,columnsModel = [
          {title:'产品',width:140,key:'product',align:'center'},
          {title:'产品规格',width:140,key:'specs',align:'center',},
          {title:'单价(元）',width:140,key:'price',align:'center',},
          {title:'数量',width:140,key:'numbers',align:'center',},
          {title:'总价',width:140,key:'priceTotal',align:'center',},
          { title: '收款金额', width: 140, key: 'receiptPrice', align: 'center',
            render: (h, params) => {
              return h('InputNumber', {
                props: {
                  value: params.row.receiptPrice,
                  min: 0,
                  max: vm.dataModel[params.index].priceTotal
                },
                on: {
                  'on-change': (v) => {
                    params.row.receiptPrice = v
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          { title: '毛利', width: 140, key: 'maori', align: 'center',
            render: (h, params) => {
              return h('InputNumber', {
                props: {
                  value: params.row.maori,
                  min: 0
                },
                on: {
                  'on-change': (event) => {
                    params.row.maori = event
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          }]

        if(type == 1) {
          this.dataModel = JSON.parse(row.productJson)
          this.inputForm.value.id = row.id
        }
        this.columnsModel = columnsModel
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
        if(newVal.price != this.calcTotalPrice('receiptPrice')){
          this.$Message.warning('产品的总价与成交金额不相等')
          return
        }
        if(newVal.gm != this.calcTotalPrice('maori')){
          this.$Message.warning('产品的收款金额（毛利）之和与单证的收款金额（毛利）不相等')
          return
        }
        this.updateReceipt(newVal)
      },
      orderChange(val){
        this.requestOrder(val)

      },
      requestOrder(id) {
        this.requestAjax('get', 'order', {}, id).then(res => {
          if(res.success) {
            let products = [], rows = res.data.rows
            let productJson = JSON.parse(rows.productJson)
            productJson.forEach(item => {
              products.push(Object.assign({}, item, {receiptPrice: 0, maori: 0}))
            })
            this.dataModel = products
            // customerId"contactId
            this.inputForm.value.customerId = rows.customerId
            this.inputForm.value.contactId = rows.contactId
            this.inputForm.value.principal = rows.principal
          }
        })
      },
      calcTotalPrice(key){
        let totalPrice = 0
        this.dataModel.forEach(item => {
          totalPrice += Number(item[key])
        })
        return totalPrice
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
