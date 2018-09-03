<template>
  <div class="wrapper b wrapper-box">
    <div class="clear">
      <div class="fl">
        <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
        <Button type="primary" @click="addUserEvent(null, 0)">新增分类</Button>
      </div>
      <div class="fr c3">
        <span class="m-l5">所属分类：</span>
        <Select v-model="requestParam.classify" style="width:160px">
          <Option v-for="item in classifyList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Input v-model="requestParam.keyWord" placeholder="请输入产品名称..." style="width: 160px" />
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
          <Button type="primary" @click="addClassifyEvent">添加</Button>
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
          classify: '',
          keyWord: '',
          limit: 20,
          offset: 1
        },
        data: [],
        total: 0,

        columns: [
          {title: '产品编号', key: 'numbers', width: 170, sortable: false},
          {title: '产品名称', key: 'name', width: 140, sortable: false, render: this.tdRender},
          {title: '所属产品分类', key: 'classify', width: 140, sortable: false, render: this.tdRender},
          {title: '产品价格（元）', key: 'price', width: 140, sortable: false},
          {title: '毛利率（%）', key: 'gm', width: 120, sortable: false},
          {title: '备注', key: 'remark',sortable: false, render: this.tdRender},
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
                        content: '确认删除产品【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteProduct(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],

        classifyList: [],
        dataModel: [],
        columnsModel: [],
      }
    },
    created() {
      this.$nextTick(() => {
        this.requestData()
        this.requestClassifyList()
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
        this.requestAjax('get', 'product', this.requestParam).then(res => {
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

        let vm = this,
          button = [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }],
          width = '768',
          cancelText = '',
          opintions = [
            [{title:'名称',id:'name',type:'input',titlespan:5,colspan:19,required:true}],
            [{title:'编号',id:'numbers',type:'input',titlespan:5,colspan:19,required:true}],
            [{title:'所属分类',id:'classify',type:'select-opts',titlespan:5,colspan:19,relation: '',required: false, select: this.classifyList}],
            [{title:'产品价格',id:'price',type:'InputNumber',min: 0,titlespan:5,colspan:19,required:true}],
            [{title:'产品毛利率(%)',id:'gm',type:'InputNumber',min: 0,titlespan:5,colspan:19,required:true}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:5,colspan:19,required:false}]]

        switch (type){
          case 0:
            button = []
            opintions = []
            cancelText = '关闭'

            this.columnsModel = [
              {
                title: '分类名称',
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
              {
                title: '分类描述',
                key: 'remark',
                align: 'center',
                render: (h, params) => {
                  return h('Input', {
                    props: {
                      value: params.row.remark,
                    },
                    on: {
                      'on-change': (event) => {
                        params.row.remark = event.target.value
                        vm.dataModel[params.index] = params.row
                      }
                    }
                  }, [])
                },
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
                          if(utils.isEmpty(this.dataModel[params.index].name)){
                            this.$Message.warning('请填写分类名称')
                            return
                          }
                          if(utils.isEmpty(this.dataModel[params.index].remark)){
                            this.$Message.warning('请选择分类描述')
                            return
                          }
                          this.updateClassify({id: this.dataModel[params.index].id, remark: this.dataModel[params.index].remark, name: this.dataModel[params.index].name})
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
                            this.deleteClassify(this.dataModel[params.index].id)
                          }
                        }
                      }
                    }, '删除')
                  ])
                }
              }
            ]
            break
          default:
            width = '540'
            break
        }

        this.inputForm.option = {
          title: type == 0 ? '新增分类' : type == 1 ? '修改产品' : '新增产品',
          width: width,
          opintions: opintions,
          cancelText: cancelText,
          button: button
        }
        if(type > 0){
          this.inputForm.value = {
            name: row ? row.name : '',
            numbers: row ? row.numbers : '',
            classify: row ? row.classify : '',
            price: row ? row.price : 0,
            gm: row ? row.gm : 0,
            remark: row ? row.remark : ''
          }
          if(type == 1) {
            this.inputForm.value.id = row.id
          }
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

        if(this.type > 0) {
          this.updataProduct(newVal)
        }
      },
      deleteProduct(id){
        this.requestAjax('delete', 'deleteProduct', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      },
      updataProduct(data) {
        this.requestAjax('post', 'product', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },

      addClassifyEvent(){
        this.dataModel.push({id: '', name: '', remark: ''})
      },
      requestClassifyList() {
        this.requestAjax('get', 'classifyList', {sort: 'createTime'}).then(res => {
          if(res.success) {
            let data =  res.data.rows, arr = [], arr2 = []
            data.forEach( (item, i) => {
              arr.push(item)
              arr2.push({value: item.name, label: item.name})
            })
            this.dataModel = arr
            this.classifyList = arr2
          }
        })
      },
      updateClassify(data){
        this.requestAjax('post', 'classify', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestClassifyList()
          }
        })
      },
      deleteClassify(id) {
        this.requestAjax('delete', 'deleteClassify', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestClassifyList()
        })
      },
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
