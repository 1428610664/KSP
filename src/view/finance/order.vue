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
        <Input v-model="requestParam.keyWord" placeholder="请输入订单主题..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <!--<Button type="primary">导入</Button>-->
      <span class="" style="line-height: 30px">成交金额汇总（元）：<span class="c1 fz14">{{price}}</span></span>
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
      <template slot="table">
        <div class="m-t10 m-b10 clear">
          <h3 class="c2 fl" style="font-weight: bold">产品明细</h3>
          <Button class="fr" type="primary" @click="addProductEvent">添加</Button>
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
      let vm = this;
      return {
        type: 0,
        price: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        dataModel: [],
        columnsModel: [
          {title: '产品',
            width: 140,
            align: 'center',
            render: (h, params) => {
              let products = []
              this.products.forEach(item => {
                products.push(
                  h('Option',{ props: {value: item.value}}, item.label))
              })
              return h('Select', {
                  props:{
                    value: this.dataModel[params.index].productId,
                  },
                  on: {
                    'on-change':(event) => {
                      this.dataModel[params.index].product = this.products[this._findIndex(event)].label
                      this.dataModel[params.index].productId = event
                    }
                  }
                }, products)
            }
          },
          {
            title: '产品规格',
            width: 140,
            key: 'specs',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.specs,
                  maxlength: 50
                },
                on: {
                  'on-change': (event) => {
                    params.row.specs = event.target.value
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          {
            title: '产品型号',
            width: 140,
            key: 'model',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.model,
                  maxlength: 50
                },
                on: {
                  'on-change': (event) => {
                    params.row.model = event.target.value
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          {
            title: '产品批次',
            width: 140,
            key: 'batch',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.batch,
                  maxlength: 50
                },
                on: {
                  'on-change': (event) => {
                    params.row.batch = event.target.value
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          {
            title: '单价(元）',
            width: 140,
            align: 'center',
            render: (h, params) => {
              return h('InputNumber', {
                props: {
                  value: params.row.price,
                  min: 0,
                },
                on: {
                  'on-change': (v) => {
                    params.row.price = v
                    params.row.priceTotal = v * params.row.numbers
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          {
            title: '数量',
            width: 140,
            key: 'numbers',
            align: 'center',
            render: (h, params) => {
              return h('InputNumber', {
                props: {
                  value: params.row.numbers,
                  min: 0,
                },
                on: {
                  'on-change': (v) => {
                    params.row.numbers = v
                    params.row.priceTotal = v * params.row.price
                    vm.dataModel[params.index] = params.row
                  }
                }
              }, [])
            },
          },
          {
            title: '总价',
            width: 140,
            key: 'priceTotal',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.priceTotal,
                  readonly : true
                }
              }, [])
            },
          },
          {title: '操作',
            width: 80,
            align: 'center',
            render: (h, params) => {
              return h('div', [
               /* h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.$Message.success('修改')
                    }
                  }
                }, '修改'),*/
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'error', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.dataModel.splice(params.index, 1)
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],

        userList: [],       // 负责人
        customerList: [],   // 客户名称
        business: [],       // 所属商机
        products: [],       // 产品列表

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
          {title: '订单主题', key: 'name', width: 160, sortable: true, render: this.tdRender},
          {title: '客户名称', key: 'customerName', sortable: true, render: this.tdRender},
          {title: '客户联系人', key: 'contactName', sortable: true, render: this.tdRender},
          {title: '成交金额', key: 'price', sortable: true},
          {title: '签约日期', width: 160, sortable: true, render: (h, params) => {
              return h('div', [
                h('span', params.row.signTime ? new Date(params.row.signTime.time).format('yyyy-MM-dd hh:mm:ss') : '')
              ])
            }},
          {title: '所属商机', key: 'businessName', sortable: true, render: this.tdRender},
          {title: '负责人', key: 'principalName', sortable: true, render: this.tdRender},
          {title: '负责部门', key: 'principalDepartmentName', sortable: true, render: this.tdRender},
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
                        content: '确认删除订单【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteOrders(params.row.id)
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
        this.requestCommon({queryUsers: true,queryCustomer: true,queryBusiness: true,queryProduct: true}, (res)=> {
          if(res.success) {
            this.userList= res.data.users
            this.customerList = res.data.customers
            this.products = res.data.products
            this.business = res.data.business
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'orders', this.requestParam).then(res => {
          if(res.success) {
            this.price = res.data.price
            this.data = res.data.rows
            this.total = res.data.rows.length
          }
        })
      },
      updateOrders(data){
        Object.assign(data,{productJson: JSON.stringify(this.dataModel)})
        this.requestAjax('post', 'orders', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteOrders(id) {
        this.requestAjax('delete', 'deleteOrders', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false
        this.type = type

        this.dataModel = []

          this.inputForm.option = {
          title: type == 1 ? '修改订单' : '新增订单',
          width: '768',
          opintions: [
            [{title:'订单主题',id:'name',type:'input',titlespan:4,colspan:20,required:true}],
            [{link: true,linkOpts: [{title:'客户名称',id:'customerId',type:'select-opts', titlespan:4,colspan:8,required:true, url: 'customerList'},
                {title:'客户联系人',id: 'contactId',type:'select-opts',titlespan:4,colspan:8,required:true, url: 'contactList',parmsId: 'customerId'}]}],
            [{title:'成交金额(元)',id:'price',type:'InputNumber',min: 0,titlespan:4,colspan:8,required:true},
              {title:'签约日期',id:'signTime',type:'time',titlespan:4,colspan:8,required:true}],
            [{title:'所属商机',id:'businessId',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true, select: this.business},
              {title:'负责人',id:'principal',type:'select-opts',titlespan:4,colspan:8,relation: '',required:true, select: this.userList}],
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
          contactId: row ? row.contactId : '',
          price: row ? row.price : 0,
          businessId: row ? row.businessId : '',
          principal: row ? row.principal : this.userId,
          signTime: row && row.signTime ? new Date(row.signTime.time).format('yyyy-MM-dd hh:mm:ss') : '',
          remark: row ? row.remark : ''
        }
        if(type == 1) {
          this.dataModel = row.productJson ? JSON.parse(row.productJson) : []
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
        console.log("----------" + JSON.stringify(newVal))
        if(this._checkValue()) {
          console.log(newVal.price, this.calcTotalPrice())
          if(newVal.price != this.calcTotalPrice()){
            this.$Message.warning('成交金额与产品明细总价格不一致')
            return
          }
          this.updateOrders(newVal)
        }
      },
      addProductEvent() {
        this.dataModel.push({productId: '',product: '',specs: '',model: '', batch: '', price: 0, numbers: 0, priceTotal: ''})
      },
      _checkValue(){
        let mark = true
        for(let item of this.dataModel) {
          if(!item.productId) {
            this.$Message.warning('请选择产品')
            mark = false
            break;
          }
        }
        return mark
      },
      _findIndex(id){
        return this.products.findIndex(item => {
          return item.value == id
        })
      },
      calcTotalPrice(){
        let totalPrice = 0
        this.dataModel.forEach(item => {
          totalPrice += Number(item.priceTotal)
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
