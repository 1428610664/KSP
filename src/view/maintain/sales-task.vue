<template>
  <div class="m-10 b wrapper-box">
    <div class="clear">
      <Button class="fl" type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <div class="fr c3">
        <span>年度：</span>
        <Select v-model="requestParam.year" class="m-r5" style="width:140px">
          <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>负责人：</span>
        <Select v-model="principal" :multiple="true" :filterable="true" style="width:240px">
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
            <Select v-model="requestParam.year" class="m-r5" style="width:140px">
              <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <span>负责人：</span>
            <Select v-model="principal" :multiple="true" :filterable="true" style="width:240px">
              <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
          <Alert class="fl m-l10" type="error">说明：选择多人后，可批量设置销售任务与毛利</Alert>
        </div>

        <div class="fbox m-t10">
          <div class="flex" style="padding-right: 10px">
            <h3 class="ct" style="font-weight: 700">销售任务</h3>
            <div class="item-wrapper fbox">
              <div class="item-label">占比</div>
              <div class="flex">
                <Input placeholder="任务 + 毛利 = 100" style="width: 120px" /> %
              </div>
            </div>
            <div class="item-wrapper fbox">
              <div class="item-label"><span class="red_tip">*</span> 全年合计（元）</div>
              <div class="flex">
                <Input placeholder="与【任务季度任务】汇总值相等" style="width: 184px" />
                <Button type="primary">平均分配</Button>
              </div>
            </div>

            <i-table class="m-t10" :columns="model.t1Columns" :data="model.t1Data"  border size="small"></i-table >
            <i-table class="m-t10" :columns="model.t3Columns" :data="model.t3Data"  border size="small"></i-table >
          </div>
          <div class="flex" style="border-left: 1px solid #ddd; padding-left: 10px">
            <h3 class="ct" style="font-weight: 700">销售毛利</h3>
            <div class="item-wrapper fbox">
              <div class="item-label">占比</div>
              <div class="flex">
                <Input placeholder="任务 + 毛利 = 100" style="width: 120px;display: inline-block" /> %
              </div>
            </div>
            <div class="item-wrapper fbox">
              <div class="item-label"><span class="red_tip">*</span> 全年合计（元）</div>
              <div class="flex">
                <Input placeholder="与【毛利季度任务】汇总值相等" style="width: 184px;display: inline-block" />
                <Button type="primary">平均分配</Button>
              </div>
            </div>

            <i-table class="m-t10" :columns="model.t2Columns" :data="model.t2Data"  border size="small"></i-table >
            <i-table class="m-t10" :columns="model.t4Columns" :data="model.t4Data"  border size="small"></i-table >
          </div>
        </div>

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
          year: '2018',
          principal: '',
          limit: 20,
          offset: 1
        },
        yearList: [{value: '2018', label: '2018'},{value: '2017', label: '2017'},{value: '2016', label: '2016'},{value: '2015', label: '2015'}],
        userList: [],

        data: [{}],
        total: 0,
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        columns: [
          {title: '营销人员编号', key: 'number', width: 160, sortable: false, render: this.tdRender},
          {title: '姓名', key: 'name', sortable: false, render: this.tdRender},
          {title: '部门', key: 'bp', sortable: false},
          {title: '年度', key: 'sow', width: 140, sortable: false},
          {title: '销售任务（元）', key: 'rad', width: 160, sortable: false},
          {title: '销售毛利（元）', key: 'phone', width: 160, sortable: false, render: this.tdRender},
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
                        content: '确认删除客户【'+params.row.name+'】？',
                        onOk: () => {
                          // this.deleteCustomer(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],

        dataModel: [],
        model: {
          t1Data: [
            {name: '季度任务（元）', start_RAD_BP: 1,end_RAD_BP: 2},
            {name: '全年占比%', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '月度平均（元）', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '月度年份占比%', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '周平均（元）', start_RAD_BP: 11,end_RAD_BP: 22}
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
                  }
                }]
            }
          ],
          t2Data: [
            {name: '季度毛利（元）', start_RAD_BP: 1,end_RAD_BP: 2},
            {name: '全年占比%', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '月度平均（元）', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '月度年份占比%', start_RAD_BP: 11,end_RAD_BP: 22},
            {name: '周平均（元）', start_RAD_BP: 11,end_RAD_BP: 22}
          ],
          t2Columns: [
            { title: '全年销售毛利分布', align: 'center',
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
                  }
                }]
            }
          ],
          t3Data: [
            {name: '产品分类1', start_RAD_BP: 1,end_RAD_BP: 2},
            {name: '产品分类2', start_RAD_BP: 11,end_RAD_BP: 22}
          ],
          t3Columns: [
            { title: '全年产品线分配', align: 'center',
              children: [
                { title: ' ', key: 'name', align: 'center'},
                {
                  title: '分配占比%',
                  key: 'start_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
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
                  }
                },{
                  title: '权重系数%',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
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
                  }
                }]
            }
          ],
          t4Data: [
            {name: '产品分类1', start_RAD_BP: 1,end_RAD_BP: 2},
            {name: '产品分类2', start_RAD_BP: 11,end_RAD_BP: 22}
          ],
          t4Columns: [
            { title: '全年产品线分配', align: 'center',
              children: [
                { title: ' ', key: 'name', align: 'center'},
                {
                  title: '分配占比%',
                  key: 'start_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
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
                  }
                },{
                  title: '权重系数%',
                  key: 'end_RAD_BP',
                  align: 'center',
                  render: (h, params) => {
                    return h('InputNumber', {
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
                  }
                }]
            }
          ],

        }
      }
    },
    created() {
      this.$nextTick(() => {
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
      requestData(){

      },
      requestCommons(){
        this.requestCommon({queryUsers: true}, (res)=> {
          if(res.success) {
            this.userList= res.data.users
          }
        })
      },

      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false

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

      },
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
