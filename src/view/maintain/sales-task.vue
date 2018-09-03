<template>
  <div class="m-10 b wrapper-box">
    <div class="clear">
      <Button class="fl" type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <div class="fr c3">
        <span>年度：</span>
        <Select v-model="requestParam.year" class="m-r5" style="width:120px">
          <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>负责人：</span>
        <Select v-model="requestParam.userId" :filterable="true" style="width:160px">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
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
      <template slot="table">

        <div class="clear">
          <div class="fl c3">
            <span><span class="red_tip">*</span>年度：</span>
            <Select v-model="dataModel.year" class="m-r5" style="width:120px">
              <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <span><span class="red_tip">*</span>负责人：</span>
            <Select v-model="dataModel.userId" style="width:160px">
              <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
          <!--<Alert class="fl m-l10" type="error">说明：选择多人后，可批量设置销售任务与毛利</Alert>-->
        </div>

        <Row class="m-t20">
          <i-col span="12">
            <div style="padding-right: 10px">
              <h3 class="ct" style="font-weight: 700">销售任务</h3>
              <div class="item-wrapper fbox">
                <div class="item-label">占比</div>
                <div class="flex">
                  <InputNumber :min="0" :max="100" v-model="dataModel.salesVolumeRatio" placeholder="任务 + 毛利 = 100" style="width: 120px" /> %
                </div>
              </div>
              <div class="item-wrapper fbox">
                <div class="item-label"><span class="red_tip">*</span> 全年合计（元）</div>
                <div class="flex">
                  <InputNumber :min="0" v-model="dataModel.salesVolume" placeholder="与【任务季度任务】汇总值相等" style="width: 184px" />
                  <Button type="primary" @click="averageEnent(1)">平均分配</Button>
                </div>
              </div>

              <i-table class="m-t10" :columns="model.t1Columns" :data="model.t1Data"  border size="small"></i-table >
              <Button class="m-t10" type="primary" size="small" @click="addProductLine(3)">新增产品线</Button>
              <i-table class="m-t10" :columns="model.t3Columns" :data="model.t3Data"  border size="small"></i-table >
            </div>
          </i-col>
          <i-col span="12">
            <div style="border-left: 1px solid #ddd; padding-left: 10px">
              <h3 class="ct" style="font-weight: 700">销售毛利</h3>
              <div class="item-wrapper fbox">
                <div class="item-label">占比</div>
                <div class="flex">
                  <InputNumber :min="0" :max="100" v-model="dataModel.grossProfitRatio" placeholder="任务 + 毛利 = 100" style="width: 120px;display: inline-block" /> %
                </div>
              </div>
              <div class="item-wrapper fbox">
                <div class="item-label"><span class="red_tip">*</span> 全年合计（元）</div>
                <div class="flex">
                  <InputNumber :min="0" v-model="dataModel.grossProfit" placeholder="与【毛利季度任务】汇总值相等" style="width: 184px;display: inline-block" />
                  <Button type="primary" @click="averageEnent(2)">平均分配</Button>
                </div>
              </div>

              <i-table class="m-t10" :columns="model.t2Columns" :data="model.t2Data"  border size="small"></i-table >
              <Button class="m-t10" type="primary" size="small" @click="addProductLine(4)">新增产品线</Button>
              <i-table class="m-t10" :columns="model.t4Columns" :data="model.t4Data"  border size="small"></i-table >
            </div>
          </i-col>
        </Row>
      </template>
    </input-from>

  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'

  export default {
    name: "sales-task",
    data() {
      let vm = this
      return {
        principal: [],
        requestParam: {
          year: '',
          userId: '',
          limit: 20,
          offset: 1
        },
        yearList: [{value: '2018', label: '2018'},{value: '2017', label: '2017'},{value: '2016', label: '2016'},{value: '2015', label: '2015'}],
        userList: [],
        userListData: [],
        productList: [],    // 产品列表

        data: [],
        total: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        columns: [
          {title: '营销人员编号', key: 'id', width: 160, sortable: false, render: this.tdRender},
          {title: '姓名', key: 'userName', sortable: false, render: this.tdRender},
          {title: '部门', key: 'userDepartmentName', sortable: false},
          {title: '年度', key: 'year', width: 140, sortable: false},
          {title: '销售任务（元）', key: 'salesVolume', width: 160, sortable: false},
          {title: '销售毛利（元）', key: 'grossProfit', width: 160, sortable: false, render: this.tdRender},
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
                        content: '确认删除销售任务？',
                        onOk: () => {
                          this.deleteSalesTask(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],

        dataModel: {
          year: '',
          userId: '',
          userName: '',
          salesVolumeRatio: 0,
          grossProfitRatio: 0,
          salesVolume: 0,
          grossProfit: 0,
        },
        model: {
          t1Data: [
            {name: '季度毛利（元）',a: 0, b: 0, c: 0, d: 0},
            {name: '全年占比%',a: 0, b: 0, c: 0, d: 0},
            {name: '月度平均（元）'},
            {name: '月度年份占比%'},
            {name: '周平均（元）'},
          ],
          t1Columns: [
            { title: '全年销售任务分布', align: 'center',
              children: [
                { title: ' ', key: 'name', align: 'center'},
                {
                  title: '第一季度',
                  key: 'start_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.a,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.a = v
                          vm.model.t1Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },{
                  title: '第二季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.b,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.b = v
                          vm.model.t1Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },{
                  title: '第三季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.c,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.c = v
                          vm.model.t1Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },{
                  title: '第四季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.d,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.d = v
                          vm.model.t1Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                }]
            }
          ],
          t2Data: [
            {name: '季度毛利（元）',a: 0, b: 0, c: 0, d: 0},
            {name: '全年占比%',a: 0, b: 0, c: 0, d: 0},
            {name: '月度平均（元）'},
            {name: '月度年份占比%'},
            {name: '周平均（元）'},
          ],
          t2Columns: [
            { title: '全年销售毛利分布', align: 'center',
              children: [
                { title: ' ', key: 'name', align: 'center'},
                {title: '第一季度',
                  key: 'start_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.a,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.a = v
                          vm.model.t2Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '第二季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.b,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.b = v
                          vm.model.t2Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '第三季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.c,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.c = v
                          vm.model.t2Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '第四季度',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    if(params.index > 1) {
                      return h('div', [
                        h('span', params.index == 3 ? '季度占比/3' : '季度/3')
                      ])
                    }
                    return h('InputNumber', {
                      props: {
                        value: params.row.d,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.d = v
                          vm.model.t2Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                }]
            }
          ],
          t3Data: [/*{productId: '', ratio: 1,weight: 2}*/],
          t3Columns: [
            { title: '全年产品线分配', align: 'center',
              children: [
                {title: '产品',
                  align: 'center',
                  render: (h, params) => {
                    let productList = []
                    this.productList.forEach(item => {
                      productList.push(
                          h('Option',{
                            props: {
                              value: item.value
                            }
                          },item.label)
                        )
                    })
                    return h('Select', {
                      props:{
                        value: params.row.productId,
                      },
                      on: {
                        'on-change':(event) => {
                          vm.model.t3Data[params.index].productId = event
                        }
                      }
                    }, productList)
                  }
                },
                {
                  title: '分配占比%',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
                      props: {
                        value: params.row.ratio,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.ratio = v
                          vm.model.t3Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {
                  title: '权重系数%',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
                      props: {
                        value: params.row.weight,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.weight = v
                          vm.model.t3Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '操作',
                  width: 90,
                  align: 'center',
                  render: (h, params) => {
                    return h('div', [
                      h('Button', {
                        props: {type: 'error', size: 'small'},
                        nativeOn: {
                          click: () => {
                            this.deleteProductLine(3, params.index)
                          }
                        }
                      }, '删除')])
                  }
                }]
            }
          ],
          t4Data: [/*{productId: '', ratio: 1,weight: 2}*/],
          t4Columns: [
            { title: '全年产品线分配', align: 'center',
              children: [
                {title: '产品',
                  align: 'center',
                  render: (h, params) => {
                    let productList = []
                    this.productList.forEach(item => {
                      productList.push(
                        h('Option',{
                          props: {
                            value: item.value
                          }
                        },item.label)
                      )
                    })
                    return h('Select', {
                      props:{
                        value: params.row.productId,
                      },
                      on: {
                        'on-change':(event) => {
                          vm.model.t4Data[params.index].productId = event
                        }
                      }
                    }, productList)
                  }
                },
                {title: '分配占比%',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
                      props: {
                        value: params.row.ratio,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.ratio = v
                          vm.model.t4Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '权重系数%',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
                      props: {
                        value: params.row.weight,
                        min: 0
                      },
                      on: {
                        'on-change': (v) => {
                          params.row.weight = v
                          vm.model.t4Data[params.index] = params.row
                        }
                      }
                    }, [])
                  }
                },
                {title: '操作',
                  width: 90,
                  align: 'center',
                  render: (h, params) => {
                    return h('div', [
                      h('Button', {
                        props: {type: 'error', size: 'small'},
                        nativeOn: {
                          click: () => {
                            this.deleteProductLine(4, params.index)
                          }
                        }
                      }, '删除')])
                  }
                }]
            }
          ],

        }
      }
    },
    created() {
      this.$nextTick(() => {
        this.requestProduct()
        this.requestUsers()
        this.requestData()
      })
    },
    methods: {
      searchEvent() {
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        // this.requestParam.principal = this.principal.join(',')
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
      requestData(){
        this.requestAjax('get', 'salesTask', this.requestParam).then(res => {
          if(res.success) {
            this.data = res.data.rows
            this.total = res.data.total
          }
        })
      },
      deleteSalesTask(id) {
        this.requestAjax('delete', 'deleteSalesTask', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      updateSalesTask(data){
        this.requestAjax('post', 'salesTask', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      requestCommons(){
        this.requestCommon({queryUsers: true}, (res)=> {
          if(res.success) {
            this.userList= res.data.users
          }
        })
      },
      requestUsers(){
        this.requestAjax('get', 'users', {}).then(res => {
          if(res.success) {
            this.userListData = res.data.rows
            this.userList = this._parseSelectData(res.data.rows)
          }
        })
      },
      requestProduct(){
        this.requestAjax('get', 'productList', {}).then(res => {
          if(res.success) {
            this.productList = this._parseSelectData(res.data.rows)
          }
        })
      },
      addProductLine(v){
        this.model['t'+v+'Data'].push( {productId: '', ratio: 0,weight: 0})
      },
      deleteProductLine(v, index){
        this.model['t'+v+'Data'].splice(index, 1)
      },
      averageEnent(v){
        if(v == 1) {
          let salesVolume = this.dataModel.salesVolume ? this.dataModel.salesVolume / 4 : 0,
            salesVolumeRatio = this.dataModel.salesVolumeRatio ? this.dataModel.salesVolumeRatio / 4 : 0
          this.model.t1Data = [{name: '季度毛利（元）',a: salesVolume, b: salesVolume, c: salesVolume, d: salesVolume}, {name: '全年占比%',a: salesVolumeRatio, b: salesVolumeRatio, c: salesVolumeRatio, d: salesVolumeRatio}, {name: '月度平均（元）'}, {name: '月度年份占比%'}, {name: '周平均（元）'},]
        }else{
          let grossProfit = this.dataModel.grossProfit ? this.dataModel.grossProfit / 4 : 0,
            grossProfitRatio = this.dataModel.grossProfitRatio ? this.dataModel.grossProfitRatio / 4 : 0
          this.model.t2Data = [{name: '季度毛利（元）',a: grossProfit, b: grossProfit, c: grossProfit, d: grossProfit}, {name: '全年占比%',a: grossProfitRatio, b: grossProfitRatio, c: grossProfitRatio, d: grossProfitRatio}, {name: '月度平均（元）'}, {name: '月度年份占比%'}, {name: '周平均（元）'},]
        }
      },

      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false

        this.inputForm.value.id = ''
        this.dataModel = {year: '', userId: '', userName: '', salesVolumeRatio: 0, grossProfitRatio: 0, salesVolume: 0, grossProfit: 0,}
        this.model.t3Data = []
        this.model.t4Data = []
        this.model.t1Data = [{name: '季度毛利（元）',a: 0, b: 0, c: 0, d: 0}, {name: '全年占比%',a: 0, b: 0, c: 0, d: 0}, {name: '月度平均（元）'}, {name: '月度年份占比%'}, {name: '周平均（元）'},]
        this.model.t2Data = [{name: '季度毛利（元）',a: 0, b: 0, c: 0, d: 0}, {name: '全年占比%',a: 0, b: 0, c: 0, d: 0}, {name: '月度平均（元）'}, {name: '月度年份占比%'}, {name: '周平均（元）'},]

        this.inputForm.option = {
          title: type == 1 ? '修改销售任务与毛利' : '新增销售任务与毛利',
          width: '1040',
          opintions: [],
          button:  [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        if(type == 1) {
          this.inputForm.value.id = row.id
          for(let k in this.dataModel){
            this.dataModel[k] = row[k]
          }
          this.model.t3Data = JSON.parse(row.salesVolumeJson)
          this.model.t4Data = JSON.parse(row.grossProfitJson)
          this.model.t1Data[0].a = row.salesVolumeQuarter1
          this.model.t1Data[0].b = row.salesVolumeQuarter2
          this.model.t1Data[0].c = row.salesVolumeQuarter3
          this.model.t1Data[0].d = row.salesVolumeQuarter4
          this.model.t1Data[1].a = row.salesVolumeQuarter1RatioYear
          this.model.t1Data[1].b = row.salesVolumeQuarter2RatioYear
          this.model.t1Data[1].c = row.salesVolumeQuarter3RatioYear
          this.model.t1Data[1].d = row.salesVolumeQuarter4RatioYear
          this.model.t2Data[0].a = row.grossProfitQuarter1
          this.model.t2Data[0].b = row.grossProfitQuarter2
          this.model.t2Data[0].c = row.grossProfitQuarter3
          this.model.t2Data[0].d = row.grossProfitQuarter4
          this.model.t2Data[1].a = row.grossProfitQuarter1RatioYear
          this.model.t2Data[1].b = row.grossProfitQuarter2RatioYear
          this.model.t2Data[1].c = row.grossProfitQuarter3RatioYear
          this.model.t2Data[1].d = row.grossProfitQuarter4RatioYear
        }
      },
      getInputVal (val, type) {
        this.inputForm.value = val
        if (type === 'cancel') {
          this.inputForm.modalshow = false
          return
        }
        // salesVolumeRatio: 0, grossProfitRatio: 0,
        if(!this.dataModel.year){
          this.$Message.warning('请选择年度')
          return
        }
        if(!this.dataModel.userId){
          this.$Message.warning('请选择负责人')
          return
        }
        if(!this.dataModel.salesVolume){
          this.$Message.warning('请填写销售任务全年合计')
          return
        }
        if(!this.dataModel.grossProfit){
          this.$Message.warning('请填写销售毛利全年合计')
          return
        }

        let data = {}
        Object.assign( data, val, this.dataModel,
          {
            salesVolumeQuarter1: this.model.t1Data[0].a,
            salesVolumeQuarter2: this.model.t1Data[0].b,
            salesVolumeQuarter3: this.model.t1Data[0].c,
            salesVolumeQuarter4: this.model.t1Data[0].d,
            salesVolumeQuarter1RatioYear: this.model.t1Data[1].a,
            salesVolumeQuarter2RatioYear: this.model.t1Data[1].b,
            salesVolumeQuarter3RatioYear: this.model.t1Data[1].c,
            salesVolumeQuarter4RatioYear: this.model.t1Data[1].d,

            grossProfitQuarter1: this.model.t2Data[0].a,
            grossProfitQuarter2: this.model.t2Data[0].b,
            grossProfitQuarter3: this.model.t2Data[0].c,
            grossProfitQuarter4: this.model.t2Data[0].d,
            grossProfitQuarter1RatioYear: this.model.t2Data[1].a,
            grossProfitQuarter2RatioYear: this.model.t2Data[1].b,
            grossProfitQuarter3RatioYear: this.model.t2Data[1].c,
            grossProfitQuarter4RatioYear: this.model.t2Data[1].d,

            salesVolumeJson: JSON.stringify(this.model.t3Data),
            grossProfitJson: JSON.stringify(this.model.t4Data)
          })
        console.log(JSON.stringify(data))
        this.updateSalesTask(data)
      },
      _findIndex(id){
        return this.userListData.findIndex(item => {
          return item.id == id
        })
      }
    },
    components: {
      inputFrom
    }
  }
</script>

<style scoped>

  .red_tip{display: inline-block; width:10px; height: 20px; color: #FF0000;vertical-align: sub;}

  .item-label{width: 110px;line-height: 30px;text-align: right;padding-right: 10px}
  .item-wrapper{margin-top:5px;margin-bottom: 5px;}

</style>
