<template>
  <div class="wrapper b wrapper-box">
    <div class="c3 ">
      <Button type="primary" @click="addUserEvent(null, 0)">添加字段</Button>
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
                :modalshow="inputForm.modalshow"/>

  </div>
</template>

<script>

  import inputFrom from 'components/model/inputFrom.vue'

  export default {
    name: "index",
    data() {
      return {
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },

        requestParam: {
          model: this.$route.path.split('/')[2],
          keyWord: '',
          limit: 20,
          offset: 1
        },

        data: [],
        total: 0,

        columns: [
          {title: '中文名称', key: 'nameCn', sortable: false},
          {title: '英文名称', key: 'nameEn', sortable: false},
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
                        content: '确认删除字段【'+params.row.nameCn+'】？',
                        onOk: () => {
                          this.deleteProps(params.row.id)
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
    watch: {
      $route (to, from) {
        this. requestParam.model = this.$route.path.split('/')[2],
        this.requestData()
      },
    },
    created() {
      setTimeout(() => {
        this.requestData()
      }, 20)
    },
    methods: {
      changePage (v) {
        this.requestParam.offset = v
        this.requestData()
      },
      changeSize (v) {
        this.requestParam.limit = v
        this.requestData()
      },
      requestData() {
        this.requestAjax('get', 'props', this.requestParam).then(res => {
          if(res.success) {
            this.total = res.data.rows.length
            this.data = res.data.rows
          }
        })
      },
      addUserEvent (row, type) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false

        let opintions = [
            [{title:'中文名称',id:'nameCn',type:'input',titlespan:4,colspan:20,required:true}],
            [{title:'英文名称',id:'nameEn',type:'input',titlespan:4,colspan:20,required:true}]],
          value = {
            nameCn: row ? row.nameCn : '',
            nameEn: row ? row.nameEn: ''
          }

        this.inputForm.option = {
          title: type == 0 ? '添加自定义字段' : '修改自定义字段',
          width: '480',
          opintions: opintions,
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = value
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
        let newVal = {model: this.requestParam.model}
        Object.assign(newVal, val)
        this.updateProps(newVal)
      },
      updateProps(data){
        this.requestAjax('post', 'props', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteProps(id){
        this.requestAjax('delete', 'deleteProps', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.requestData()
        })
      }
    },
    components: {
      inputFrom
    }
  }
</script>

<style scoped>

</style>
