<template>
  <div class="wrapper b wrapper-box">
    <div class="clear">
      <div class="fr c3">
        <span>负责人：</span>
        <Select v-model="principal" :multiple="true" :filterable="true" style="width:240px">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Input v-model="requestParam.keyWord" placeholder="请输入客户名称..." style="width: 160px" />
        <Button type="primary" @click="searchEvent">查询</Button>
        <!--<Button @click="addUserEvent(null, 0)">高级查询</Button>-->
      </div>
    </div>
    <div class="c3 clear">
      <Button type="primary" @click="addUserEvent(null, 2)">新增</Button>
      <!--<Button type="primary">导入</Button>-->
      <!--<Button type="primary">导出</Button>-->
      <span class="" style="line-height: 30px">BP汇总（万元）：<span class="c1 fz14">{{bp}}</span></span>

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
      <template v-if="type == 4" slot="table">
        <div class="">
          <Menu mode="horizontal" :active-name="menuActive" @on-select="menuSelect">
            <MenuItem name="0">联系人</MenuItem>
            <MenuItem name="1">商业机会</MenuItem>
            <MenuItem name="2">活动</MenuItem>
            <MenuItem name="3">订单</MenuItem>
            <MenuItem name="4">收款单</MenuItem>
          </Menu>
        </div>
        <i-table class="m-t10" :columns="columnsModel" :data="dataModel" border size="small"></i-table>
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
        bp: 0,
        menuActive: '0',
        propsKey: 'customer', // 自定义字段请求key值

        treeData: [{
          title: '根据【客户】对应的【联系人】拼接成树',
          expanded: true,
          children: [{
            title: '姓名--角色--职位1',
            expanded: true,
            children: [{
              title: '下级联系人姓名--角色--职位1'
            }, {
              title: '下级联系人姓名--角色--职位2'
            }, {
              title: '下级联系人姓名--角色--职位3'
            }]
          }, {
            title: '姓名--角色--职位2',
            expanded: true,
            children: [{
              title: '下级联系人姓名--角色--职位1'
            }, {
              title: '下级联系人姓名--角色--职位2'
            }]
          }]
        }],
        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
        columnsModel: [],
        dataModel: [],

        principal: [],
        requestParam: {
          principal: '',
          keyWord: '',
          limit: 20,
          offset: 1
        },

        userList: [],     // 负责人
        industryList: [], // 所属行业
        classifyList: [], // 分类

        data: [],
        total: 0,

        columns: [
          // {title: '编号', key: 'id', width: 170, sortable: true},
          {title: '客户名称',show: true, key: 'name', width: 160, sortable: true, render: this.tdRender},
          {title: 'BP(万元)',show: true, key: 'bp', width: 120, sortable: true},
          {title: 'SOW(%)',show: true, key: 'sow', width: 120, sortable: true},
          // {title: 'RFM', key: 'rfm', width: 120, sortable: true},
          {title: 'RAD',show: true, key: 'rad', width: 120, sortable: true},
          {title: '电话',show: true, key: 'phone', width: 160, sortable: true, render: this.tdRender},
          {title: '传真',show: true, key: 'fax', width: 120, sortable: true, render: this.tdRender},
          {title: '网址',show: true, key: 'webUrl', width: 170, sortable: true, render: this.tdRender},
          {title: '分类',show: true, key: 'type', width: 120, sortable: true},
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
                        content: '确认删除客户【'+params.row.name+'】？',
                        onOk: () => {
                          this.deleteCustomer(params.row.id)
                        }
                      })
                    }
                  }
                }, '删除'),
                /*h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.addUserEvent(params.row, 3)
                    }
                  }
                }, '决策树'),
                h('Button', {
                  style: {marginRight: '5px'},
                  props: {type: 'success', size: 'small'},
                  nativeOn: {
                    click: () => {
                      this.$Message.success('相关信息')
                      this.addUserEvent(null, 4)
                    }
                  }
                }, '相关信息')*/
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
      this.$nextTick(()=> {
        this.requestProps()
        this.requestData()
        this.requestCommons()
      })
    },
    methods: {
      menuSelect(name) {
        this.$Message.success(name)
        this.columnsModel = this._getColumnsData(Number(name))
      },
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
        this.requestCommon({queryEnums: true,queryUsers: true}, (res)=> {
          if(res.success) {
            let enums = this._parseEnums(res.data.enums)
            this.userList= res.data.users
            this.industryList = enums[this.__ENUMS_KEY__.industry]
            this.classifyList = enums[this.__ENUMS_KEY__.classify]
          }
        })
      },
      requestData() {
        this.requestAjax('get', 'customer', this.requestParam).then(res => {
          if(res.success) {
            this.data = res.data.rows
            this.bp = res.data.bp
            this.total = res.data.rows.length
          }
        })
      },
      updateUser(data){
        this.requestAjax('post', 'customer', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.requestData()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteCustomer(id) {
        this.requestAjax('delete', 'deleteCustomer', {}, id).then(res => {
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

        let title = '',
          opintions = [
            [{title:'客户名称',id:'name',type:'input',titlespan:3,colspan:21,required:true}],
            [{title:'客户地址',id:'citys',type:'address',titlespan:3,colspan:21,required:true}],
            [{title:'详细地址',id:'address',type:'input',titlespan:3,colspan:21,required:false}],
            [{title:'手机',id:'phone',type:'input',titlespan:3,colspan:9,required:false},
              {title:'传真',id:'fax',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'网址',id:'webUrl',type:'input',titlespan:3,colspan:9,required:false},
              {title:'Email',id:'email',type:'input',titlespan:3,colspan:9,required:false}],
            [{title:'所属行业',id:'industry',type:'select-opts',titlespan:3,colspan:9,relation: '',required:false, select: this.industryList},
              {title:'分类',id:'type',type:'select-opts',titlespan:3,colspan:9,relation: '',required:false, select: this.classifyList}],
            [{title:'BP（万元）',id:'bp',type:'input',titlespan:3,colspan:9,required:false},
              {title:'负责人',id:'principal',type:'select-opts',titlespan:3,colspan:9,relation: '', filterable: true,required:true, select: this.userList}],
            [{title:'备注',id:'remark',type:'textarea',titlespan:3,colspan:21,required:false}],
            [{title:'联系人信息',theme: true}],
            [{title:'姓名',id:'a',type:'input',titlespan:3,colspan:9,required:false},
              {title:'手机',id:'b',type:'input',titlespan:3,colspan:9,required:false}]],
          button = [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]

        switch (type){
          case 0:
            title = '高级查询'
            break
          case 1:
            title = '修改用户'
            if(row.propsVal) this._setPropsVal(JSON.parse(row.propsVal))
            break
          case 2:
            title = '新增客户'
            break
          case 3:
            title = '客户决策树'
            button = []
            opintions = [
              [{title:'客户名称：A客户',theme: true}],
              [{title:'',id:'tree',type:'tree',titlespan:3,colspan:21,required:false}],
            ]
            break
          case 4:
            title = '客户相关'
            button = []
            opintions = [
              [{title:'客户名称：A客户',theme: true}]
            ]
            break
        }
        this.inputForm.option = {
          title: title,
          width: '768',
          opintions: opintions,
          button: button
        }
        if([0,1,2].indexOf(type) != -1){
          this.inputForm.value = {
            name: row ? row.name : '',
            citys: {city1: row ? row.city1: '',city2: row ? row.city2: '',city3: row ? row.city3: ''},
            address: row ? row.address : '',
            phone: row ? row.phone : '',
            fax: row ? row.fax : '',
            webUrl: row ? row.webUrl : '',
            email: row ? row.email : '',
            bp: row ? row.bp : '',
            remark: row ? row.remark : '',

            industry:  row ? row.industry : '',
            type:  row ? row.type : '',
            principal:  row ? row.principal : this.userId
          }
        }else if(type ==3){
          this.inputForm.value = {
            tree: this.treeData
          }
        }else {
          this.menuActive = '0'
          this.inputForm.value = {}
          this.columnsModel = this._getColumnsData(0)
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
        newVal.city1 = val.citys.city1
        newVal.city2 = val.citys.city2
        newVal.city3 = val.citys.city3
        delete  newVal.citys
        if(this.type == 1 || this.type == 2) {
          newVal.propsVal = JSON.stringify(this.propsFromVal)
          this.updateUser(newVal)
        }else{
          this.inputForm.modalshow = false
        }
      },
      _getColumnsData(type){
        let columns = [[  // 联系人
            {title: '姓名', key: 'a', width: 120, sortable: true},
            {title: '性别', key: 'b', width: 120, sortable: true},
            {title: '部门', key: 'c', width: 120, sortable: true},
            {title: '职位', key: 'd', width: 120, sortable: true},
            {title: '决策角色', key: 'e', width: 120, sortable: true},
            {title: '关系等级', key: 'f', width: 120, sortable: true},
            {title: '手机', key: 'g', width: 120, sortable: true},
            {title: '电话', key: 'h', width: 120, sortable: true},
            {title: 'Email', key: 'i', width: 120, sortable: true},
            {title: '负责人', key: 'j', width: 120, sortable: true}
          ],[ // 商业机会
            {title: '商机主题', key: 'a', width: 120, sortable: true},
            {title: '客户联系人', key: 'b', width: 120, sortable: true},
            {title: '跟踪金额', key: 'c', width: 120, sortable: true},
            {title: '赢率', key: 'd', width: 120, sortable: true},
            {title: '产品', key: 'e', width: 120, sortable: true},
            {title: '预计下单日期', key: 'f', width: 160, sortable: true},
            {title: '客户需求描述', key: 'g', width: 200, sortable: true},
            {title: '负责人', key: 'j', width: 120, sortable: true}
          ],[ // 活动
              {title: '活动类别', key: 'a', width: 120, sortable: true},
              {title: '活动类别', key: 'b', width: 120, sortable: true},
              {title: '客户联系人', key: 'c', width: 120, sortable: true},
              {title: '所属商机', key: 'd', width: 120, sortable: true},
              {title: '活动方式', key: 'e', width: 120, sortable: true},
              {title: '计划开始时间', key: 'f', width: 120, sortable: true},
              {title: '实际开始时间', key: 'g', width: 120, sortable: true},
              {title: '实际费用', key: 'h', width: 120, sortable: true},
              {title: '负责人', key: 'i', width: 120, sortable: true}
            ],[  // 订单
              {title: '订单主题', key: 'a', width: 120, sortable: true},
              {title: '客户联系人', key: 'b', width: 120, sortable: true},
              {title: '成交金额', key: 'c', width: 120, sortable: true},
              {title: '签约日期', key: 'd', width: 120, sortable: true},
              {title: '所属商机', key: 'e', width: 120, sortable: true},
              {title: '负责人', key: 'f', sortable: true}
            ],[  // 收款单
              {title: '收款主题', key: 'a', width: 120, sortable: true},
              {title: '客户联系人', key: 'b', width: 120, sortable: true},
              {title: '所属订单', key: 'c', width: 120, sortable: true},
              {title: '收款金额', key: 'd', width: 120, sortable: true},
              {title: '收款方式', key: 'e', width: 120, sortable: true},
              {title: '收款日期', key: 'f', width: 120, sortable: true},
              {title: '毛利', key: 'g', width: 120, sortable: true},
              {title: '负责人', key: 'h', width: 120, sortable: true}
            ]]
        return columns[type]
      },
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
