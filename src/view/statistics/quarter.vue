<template>
  <div class="wrapper b wrapper-box m-10">
    <div class="clear">
      <div class="fr c3">
        <Select v-model="requestParam.year" @on-change="yearChange" style="width:120px">
          <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Select v-model="requestParam.quarter" style="width:80px" class="m-r5">
          <Option v-for="item in quarterList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
        </Select>
        <div style="width: 480px;display: inline-block;vertical-align: bottom;line-height: 30px">
          <v-select :options="linkOpts" :fromVal="requestParam" @change="linkChange"></v-select>
        </div>
        <!--<span>选择部门：</span>
        <Select v-model="departmentIds" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>负责人：</span>
        <Select v-model="principalIds" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>-->
        <!--<span class="m-l15 m-r10">选择产品线：</span>
        <Select v-model="proIds" :multiple="true" :filterable="true" style="width:160px">
          <Option v-for="item in products" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>-->
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
    </div>
    <div class="fbox m-t10 c3">
      <div class="m-l15 m-r10">选择产品线：</div>
      <CheckboxGroup class="flex" v-model="proIds" style="vertical-align: sub">
        <Checkbox  v-for="(item, index) in products" :label="item.value" :key="index">{{item.label}}</Checkbox>
      </CheckboxGroup>
    </div>

    <div class="m-t10">
      <Row type="flex">
        <i-col style="padding-right: 5px" :span="12">
          <i-table ref="rad-bp" :columns="t1Columns" :data="t1Data"  border size="small"></i-table >
        </i-col >
        <i-col style="padding-left: 5px" :span="12">
          <i-table ref="rad-sow" :columns="t2Columns" :data="t2Data"  border size="small"></i-table >
        </i-col >
      </Row>
      <div class="m-t10">
        <i-table ref="rfm" :columns="t3Columns" :data="t3Data"  border size="small"></i-table >
      </div>
      <div class="m-t10">
        <i-table ref="rfm" :columns="t4Columns" :data="t4Data"  border size="small"></i-table >
      </div>
    </div>
    <div class="chart-wrapper m-t10">
      <div class="fbox">
        <div class="flex">
          <div id="chart1" style="width: 100%; height: 480px"></div>
        </div>
        <div class="flex">
          <div id="chart2" style="width: 100%; height: 480px"></div>
        </div>
      </div>
      <div class="fbox">
        <div class="flex">
          <div id="chart4" style="width: 100%; height: 480px"></div>
        </div>
        <div class="flex">
          <div id="chart3" style="width: 100%; height: 480px"></div>
        </div>
      </div>
      <div id="chart5" style="width: 100%; height: 480px"></div>
    </div>

    <h3 style="color: #515a6e;padding-left: 12px" class="fz15">销售漏斗</h3>
    <Row  class="m-t10">
      <i-col span="14">
        <i-table :row-class-name="rowClassName" :columns="t5Columns" :data="t5Data" border size="small"></i-table>
      </i-col>
      <i-col span="10">
        <div id="chart6" style="width: 100%; height: 355px"></div>
      </i-col>
    </Row>
  </div>
</template>

<script>

  import vSelect from 'components/select'
  require('echarts/theme/macarons')
  import {mapGetters} from 'vuex'

  export default {
    name: "index",
    data() {
      return {
        nowWeek: null,

        principalIds: [],
        departmentIds: [],
        proIds: [],
        quarter: '',
        year: '',
        requestParam: {
          year: '',
          quarter: '',
          departmentIds: '',      // 部门
          principalIds: '',       // 负责人
          proIds: '',             // 产品线
          limit: 20,
          offset: 1
        },
        linkOpts: [{title:'部门',id:'departmentIds',type:'select-opts', titlespan:3,colspan:9,required:false, url: 'departmentList'},
          {title:'负责人',id:'principalIds',type:'select-opts',titlespan:4,colspan:8,required:false, url: 'users',parmsId: 'department'}],

        yearList: [],
        quarterList: [],

        departments: [],  // 部门
        products: [],     // 产品
        userList: [],     // 负责人
        t4Weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13],      // 周

        t1Data: [
          {name: '收款', a: 0,b: 0, c: 0},
          {name: '毛利', a: 0,b: 0, c: 0}
        ],
        t1Columns: [

          { title: '季度任务（元）', align: 'center',
            children: [
              { title: ' ', key: 'name', align: 'center'},
              {
                title: '销售任务',
                key: 'a',
                align: 'center',
              },{
                title: '完成任务',
                key: 'b',
                align: 'center',
              },{
                title: '完成比例',
                key: 'c',
                align: 'center',
              }]
          }
        ],
        t2Data: [{a: 0, b: 0,c: 0, d: 0}],
        t2Columns: [
          { title: '商机统计（元）', align: 'center',
            children: [
              {
                title: '绿（75%~90%）',
                key: 'a',
                align: 'center',
              },{
                title: '黄（50%）',
                key: 'b',
                align: 'center',
              },{
                title: '红（10%~25%）',
                key: 'c',
                align: 'center',
              },{
                title: '合计',
                key: 'd',
                align: 'center',
              }]
          }
        ],
        t3Data: [
          {name: '收款', a1: 0,b1: 0,c1: '0%',a2: 0,b2: 0,c2: '0%',a3: 0,b3: 0,c3: '0%'},
          {name: '毛利', a1: 0,b1: 0,c1: '0%',a2: 0,b2: 0,c2: '0%',a3: 0,b3: 0,c3: '0%'}
        ],
        t3Columns: [
          {
            title: '月度任务（元）', align: 'center',
            children: [{ title: ' ', key: 'name', align: 'center', width: 120 },
              {align: 'center',
                renderHeader:(h, params) => {
                  let quarter = this._getQuarter()
                  return h('div', [h('strong', "M"+ quarter[0] +"（"+ quarter[0] +"月）")]);
                },
                children: [
                  {
                    title: '销售任务',
                    key: 'a1',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'b1',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'c1',
                    align: 'center',
                  }]
              },
              { align: 'center',
                renderHeader:(h, params) => {
                  let quarter = this._getQuarter()
                  return h('div', [h('strong', "M"+ quarter[1] +"（"+ quarter[1] +"月）")]);
                },
                children: [
                  {
                    title: '销售任务',
                    key: 'a2',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'b2',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'c2',
                    align: 'center',
                  }]
              },
              { align: 'center',
                renderHeader:(h, params) => {
                  let quarter = this._getQuarter()
                  return h('div', [h('strong', "M"+ quarter[2] +"（"+ quarter[2] +"月）")]);
                },
                children: [
                  {
                    title: '销售任务',
                    key: 'a3',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'b3',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'c3',
                    align: 'center',
                  }]
              }]
          }
        ],
        t4Data: [
          {name: '收款', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
          {name: '毛利', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
          {name: '完成比例', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
        ],
        t4Columns: [
          {
            title: '过程管理', align: 'center',
            children: [{ title: '进程管理', key: 'name', align: 'center', width: 120 },
              {
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w1',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w2',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w3',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w4',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w5',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w6',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w7',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w8',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w9',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w10',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w11',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w12',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', '第'+this.t4Weeks[params.index-1]+'周')])
                },
                key: 'w13',
                align: 'center',
              },{
                renderHeader:(h, params) => {
                  return h('div',{'class': this._getClass(params)}, [h('strong', this.t4Weeks[params.index-1] ? '第'+this.t4Weeks[params.index-1]+'周' : '')])
                },
                key: 'w14',
                align: 'center',
              }
            ]
          }
        ],
        t5Data: [{stage: '1-前期接触', number: 0, total: 0},
          {stage: '2-需求调查', number: 0, total: 0},
          {stage: '3-提出方案', number: 0, total: 0},
          {stage: '4-报价', number: 0, total: 0},
          {stage: '5-商务合同', number: 0, total: 0},
          {stage: '6-成功签约', number: 0, total: 0},
          {stage: '7-回款金额', number: 0, total: 0},
          {stage: '合计', number: 0, total: 0}],
        t5Columns: [
          {title: '阶段', show: true, key: 'stage', minWidth: 160, sortable: false, render: this.tdRender},
          {title: '客户数量', show: true, key: 'number', width: 100, sortable: false, render: this.tdRender},
          {title: '预计额', show: true, key: 'total', width: 140, sortable: false, render: this.tdRender},
        ],

        charts: {},
        optionChart: {}
      }
    },
    computed: {
      ...mapGetters([
        'userId',
        'userData'
      ])
    },
    created() {
      this.$nextTick(() => {
        this.initParams()
        this.initChart()
        this.resizeChart()
        this.requestCommons()
        // this.principalIds = [this.userId]
        this.requestParam.principalIds = this.userId
        this.requestParam.departmentIds = this.userData.user.department
        // this.requestData()
      })
    },
    methods: {
      linkChange(id, v){
        this.requestParam[id] = v
      },
      yearChange(v){
        this.setQuarterList(v)
      },
      setQuarterList(v){
        let d = new Date(), year = d.getFullYear(),
          quarter = Math.ceil((d.getMonth() + 1) / 3),
          quarterList = []
        if(v == year) {
          for(let i = 1; i < 5; i++){
            quarterList.push({value: i+'', label: 'Q' + i, disabled: i > quarter ? true : false})
          }
        }else {
          quarterList = [{value: '1', label: 'Q1', disabled: false},{value: '2', label: 'Q2', disabled: false},{value: '3', label: 'Q3', disabled: false},{value: '4', label: 'Q4', disabled: false}]
        }
        this.quarterList = quarterList
      },
      searchEvent() {
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        // this.requestParam.departmentIds = this.departmentIds.join(',')
        // this.requestParam.principalIds = this.principalIds.join(',')
        this.requestParam.proIds = this.proIds.join(',')
        this.requestData()
      },
      initParams(){
        let d = new Date(), year = d.getFullYear(), yearList = [],quarter = Math.ceil((d.getMonth() + 1) / 3),quarterList = []
        for(let i = 0; i < 4; i++){
          yearList.push({value: (year - i) + '', label: (year - i) + ''})
        }
        this.yearList = yearList
        this.setQuarterList(year)

        this.requestParam.year = d.getFullYear() + ''
        this.requestParam.quarter = Math.ceil((d.getMonth() + 1) / 3) + ''
        this.quarter = Math.ceil((d.getMonth() + 1) / 3) + ''
      },
      requestData(){
        this.requestAjax('get', 'report', this.requestParam).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.quarter = this.requestParam.quarter
            this.year = this.requestParam.year
            this.nowWeek = res.data.nowWeek
            this._parseData(res.data)
          }
        })
      },
      requestCommons(){
        this.requestCommon({queryDepartment: true,queryUsers: true,queryProduct: true}, (res)=> {
          if(res.success) {
            let proIds = []
            res.data.products.forEach((item) => {
              proIds.push(item.value)
            })
            this.proIds = proIds
            this.products = res.data.products
            // this.departments = res.data.departments
            // this.userList= res.data.users
            this.requestParam.principalIds = this.userId

            this.requestParam.proIds = this.proIds.join(',')
            this.requestData()
          }
        })
      },
      initChart(){
        this.charts.chart1 = this.$echarts.init(document.getElementById('chart1'), 'macarons')
        this.charts.chart2 = this.$echarts.init(document.getElementById('chart2'), 'macarons')
        this.charts.chart3 = this.$echarts.init(document.getElementById('chart3'), 'macarons')
        this.charts.chart4 = this.$echarts.init(document.getElementById('chart4'), 'macarons')
        this.charts.chart5 = this.$echarts.init(document.getElementById('chart5'), 'macarons')
        this.charts.chart6 = this.$echarts.init(document.getElementById('chart6'), 'macarons')

        this.optionChart.chart1 = {
          color: ['#2ec7c9', '#b6a2de'],
          title: {text: '季度任务',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
          tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
          legend: {data: ['季销售任务', '季完成任务'], top: 24},
          grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true },
          xAxis: {type: 'category',data: ['销售回款','销售订单','销售毛利']},
          yAxis: {type: 'value',boundaryGap: [0, 0.01]},
          series: [
            {name: '季销售任务',type: 'bar',barWidth: 20,animationDuration: 2800, animationEasing: 'cubicInOut', data: []},
            {name: '季完成任务',type: 'bar',barWidth: 20,animationDuration: 2800, animationEasing: 'quadraticOut', data: []}
          ]
        }
        this.optionChart.chart2 = {
            color: ['#2ec7c9', '#ffb980', '#d87a80'],
            title: {text: 'FY12Q1 - 商机明细表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
            tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
            legend: {data: ['75%&90%', '50%', '10%&25%'], top: 24},
            grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
            xAxis: {type: 'category',data: []},
            yAxis: {type: 'value',boundaryGap: [0, 0.01]},
            series: [{name: '75%&90%',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut', data: []
              },{name: '50%',type: 'bar',animationDuration: 2800, animationEasing: 'quadraticOut', data: []
              },{  name: '10%&25%',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut', data: []
              }
            ]
          }
        this.optionChart.chart3 = {
          title: {text: 'FY12Q1 - 周销售进度表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
          tooltip: {trigger: 'axis',axisPointer: {type: 'cross'},padding: [5, 10]},
          legend: {data:['BGT','QTD'], top: 24},
          grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
          xAxis: {type: 'category',boundaryGap: false, data: []
          },
          yAxis: {type: 'value'},
          series: [{name:'BGT',type:'line',smooth: true,animationDuration: 2800, animationEasing: 'cubicInOut', data:[]
            },{name:'QTD',type:'line',smooth: true,animationDuration: 2800, animationEasing: 'quadraticOut', data:[]
            }
          ]
        }
        this.optionChart.chart4 = {
          color: ['#2ec7c9', '#ffb980'],
          title: {text: 'FY12Q1 - 月销售进度表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
          tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
          legend: {data: ['预算', 'QTD'], top: 24},
          grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
          xAxis: {type: 'category',data: []},
          yAxis: {type: 'value',boundaryGap: [0, 0.01]},
          series: [
            {name: '预算',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut',barWidth: 20,data: []},
            {name: 'QTD',type: 'bar',animationDuration: 2800, animationEasing: 'quadraticOut', barWidth: 20,data: []}
          ]
        }
        this.optionChart.chart5 = {
          title: {text: '当月销售趋势图',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
          tooltip: {trigger: 'axis',axisPointer: {type: 'cross'},padding: [5, 10]},
          legend: {data:['回款','订单','毛利'], top: 24},
          grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
          xAxis: {type: 'category',boundaryGap: false,data: []},
          yAxis: {type: 'value'},
          series: [
            {name:'回款',type:'line',smooth: true,animationDuration: 2800, animationEasing: 'cubicInOut',data:[]},
            {name:'订单',type:'line',smooth: true,animationDuration: 2800, animationEasing: 'quadraticOut',data:[]},
            { name:'毛利',type:'line',smooth: true,animationDuration: 2800, animationEasing: 'backOut',data:[]}
          ]
        }
        this.optionChart.chart6 = {
          tooltip : {
            trigger: 'item',
            formatter: "{b} : {c}"
          },
          legend: {
            data : ['1-前期接触','2-需求调查','3-提出方案','4-报价','5-商务合同', '6-成功签约','7-回款金额']
          },
          calculable : true,
          series : [
            {
              type:'funnel',
              left: '10%',
              top: '24%',
              width: '80%',
              minSize: '1%',
              maxSize: '80%',
              sort: 'none',
              data:[
                {value:0, name:'1-前期接触'},
                {value:0, name:'2-需求调查'},
                {value:0, name:'3-提出方案'},
                {value:0, name:'4-报价'},
                {value:0, name:'5-商务合同'},
                {value:0, name:'6-成功签约'},
                {value:0, name:'7-回款金额'}
              ]
            }
          ]
        }

        this.charts.chart1.setOption(this.optionChart.chart1)
        this.charts.chart2.setOption(this.optionChart.chart2)
        this.charts.chart3.setOption(this.optionChart.chart3)
        this.charts.chart4.setOption(this.optionChart.chart4)
        this.charts.chart5.setOption(this.optionChart.chart5)
        this.charts.chart6.setOption(this.optionChart.chart6)
      },
      resizeChart(){
        window.onresize = () => {
          for (let k of ['chart1','chart2','chart3','chart4','chart5']){
            this.charts[k].resize()
          }
        }
      },

      _parseData(data){

        let quarters = this._getQuarter(),
          t3Data = [
            {name: '收款', a1: 0,b1: 0,c1: '0%',a2: 0,b2: 0,c2: '0%',a3: 0,b3: 0,c3: '0%'},
            {name: '毛利', a1: 0,b1: 0,c1: '0%',a2: 0,b2: 0,c2: '0%',a3: 0,b3: 0,c3: '0%'}
          ]
        let t4Data = [
          {name: '收款', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
          {name: '毛利', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
          {name: '完成比例', w1: 0,w2: 0,w3: 0,w4: 0,w5: 0,w6: 0,w7: 0,w8: 0,w9: 0,w10: 0,w11: 0,w12: 0,w13: 0},
        ], _i = 1, t4Weeks = []

        if(!data || !data.rlsQuarter) {
          this.t1Data = [{name: '收款', a: 0,b: 0, c: 0}, {name: '毛利', a: 0,b: 0, c: 0}]
          this.t2Data = [{a: 0, b: 0,c: 0, d: 0}]
          this.t3Data = t3Data
          this.t4Data = t4Data

          this.optionChart.chart1.xAxis.data = []
          this.optionChart.chart1.series[0].data = []
          this.optionChart.chart1.series[1].data = []
          this.charts.chart1.setOption(this.optionChart.chart1)

          this.optionChart.chart2.xAxis.data = []
          this.optionChart.chart2.series[0].data = []
          this.optionChart.chart2.series[1].data = []
          this.optionChart.chart2.series[2].data = []
          this.charts.chart2.setOption(this.optionChart.chart2)

          this.optionChart.chart3.xAxis.data = []
          this.optionChart.chart3.series[0].data = []
          this.optionChart.chart3.series[1].data = []
          this.charts.chart3.setOption(this.optionChart.chart3)

          this.optionChart.chart4.xAxis.data = []
          this.optionChart.chart4.series[0].data = []
          this.optionChart.chart4.series[1].data = []
          this.charts.chart4.setOption(this.optionChart.chart4)

          this.optionChart.chart5.xAxis.data = []
          this.optionChart.chart5.series[0].data = []
          this.optionChart.chart5.series[1].data = []
          this.optionChart.chart5.series[2].data = []
          this.charts.chart5.setOption(this.optionChart.chart5)
          return
        }
        this.t1Data = [{name: '收款', a: data.rlsQuarter.salesVolume,b: data.rlsQuarter.receiptSalesVolume, c: data.rlsQuarter.salesVolumeRatio.toFixed(2) + "%"},
          {name: '毛利', a: data.rlsQuarter.grossProfit,b: data.rlsQuarter.receiptGrossProfit, c: data.rlsQuarter.grossProfitRatio.toFixed(2) + "%"}]
        this.t2Data = [{a: data.business['75%-90%'], b: data.business['50%'],c: data.business['10%-25%'], d: data.business.total}]



        for(let i = 1; i < 4; i++){
          t3Data[0]['a' + i] = data.rlsMonth[quarters[i-1]].salesVolume.toFixed(2)
          t3Data[0]['b' + i] = data.rlsMonth[quarters[i-1]].receiptSalesVolume.toFixed(2)
          t3Data[0]['c' + i] = data.rlsMonth[quarters[i-1]].salesVolumeRatio.toFixed(2) + '%'
          t3Data[1]['a' + i] = data.rlsMonth[quarters[i-1]].grossProfit.toFixed(2)
          t3Data[1]['b' + i] = data.rlsMonth[quarters[i-1]].receiptGrossProfit.toFixed(2)
          t3Data[1]['c' + i] = data.rlsMonth[quarters[i-1]].grossProfitRatio.toFixed(2) + '%'
        }
        this.t3Data = t3Data


        for(let k in data.rlsWeek){
          t4Weeks.push(k * 1)
          t4Data[0]['weeks' + _i] = data.rlsWeek[k].weeks
          t4Data[0]['w'+ _i] = data.rlsWeek[k].receiptSalesVolume.toFixed(2)
          t4Data[1]['w'+ _i] = data.rlsWeek[k].receiptGrossProfit.toFixed(2)
          t4Data[2]['w'+ _i] = data.rlsWeek[k].salesVolumeRatio.toFixed(2) + '%'
          _i++
        }
        this.t4Weeks = t4Weeks
        this.t4Data = t4Data

        let chart1Key = [], Chart1Vla1 = [], Chart1Vla2 = []
        for(let k in data.quarterJobChar){
          chart1Key.push(k)
          Chart1Vla1.push( data.quarterJobChar[k][0].toFixed(2))
          Chart1Vla2.push( data.quarterJobChar[k][1].toFixed(2))
        }
        this.optionChart.chart1.xAxis.data = chart1Key
        this.optionChart.chart1.series[0].data = Chart1Vla1
        this.optionChart.chart1.series[1].data = Chart1Vla2
        this.charts.chart1.setOption(this.optionChart.chart1)

        let chart2Key = [], Chart2Vla1 = [], Chart2Vla2 = [], Chart2Vla3 = []
        for(let k in data.businessByWeeksJobChar){
          chart2Key.push(k)
          Chart2Vla3.push( data.businessByWeeksJobChar[k]['10%-25%'].toFixed(2))
          Chart2Vla2.push( data.businessByWeeksJobChar[k]['50%'].toFixed(2))
          Chart2Vla1.push( data.businessByWeeksJobChar[k]['75%-90%'].toFixed(2))
        }
        this.optionChart.chart2.xAxis.data = chart2Key
        this.optionChart.chart2.series[0].data = Chart2Vla1
        this.optionChart.chart2.series[1].data = Chart2Vla2
        this.optionChart.chart2.series[2].data = Chart2Vla3
        this.charts.chart2.setOption(this.optionChart.chart2)

        let chart3Key = [], Chart3Vla1 = [], Chart3Vla2 = []
        for(let k in data.salesByWeeksJobChar){
          chart3Key.push(k)
          Chart3Vla2.push( data.salesByWeeksJobChar[k]['QTD'].toFixed(2))
          Chart3Vla1.push( data.salesByWeeksJobChar[k]['BGT'].toFixed(2))
        }
        this.optionChart.chart3.xAxis.data = chart3Key
        this.optionChart.chart3.series[0].data = Chart3Vla1
        this.optionChart.chart3.series[1].data = Chart3Vla2
        this.charts.chart3.setOption(this.optionChart.chart3)

        let chart4Key = [], Chart4Vla1 = [], Chart4Vla2 = []
        for(let k in data.salesByMonthJobChar){
          chart4Key.push(k)
          Chart4Vla1.push( data.salesByMonthJobChar[k]['预算'].toFixed(2))
          Chart4Vla2.push( data.salesByMonthJobChar[k]['QTD'].toFixed(2))
        }
        this.optionChart.chart4.xAxis.data = chart4Key
        this.optionChart.chart4.series[0].data = Chart4Vla1
        this.optionChart.chart4.series[1].data = Chart4Vla2
        this.charts.chart4.setOption(this.optionChart.chart4)

        let chart5Key = [], Chart5Vla1 = [], Chart5Vla2 = [], Chart5Vla3 = []
        for(let k in data.nowMonthChar){
          chart5Key.push(k)
          Chart5Vla1.push( data.nowMonthChar[k]['回款'])
          Chart5Vla2.push( data.nowMonthChar[k]['订单'])
          Chart5Vla3.push( data.nowMonthChar[k]['毛利'])
        }
        this.optionChart.chart5.xAxis.data = chart5Key
        this.optionChart.chart5.series[0].data = Chart5Vla1
        this.optionChart.chart5.series[1].data = Chart5Vla2
        this.optionChart.chart5.series[2].data = Chart5Vla3
        this.charts.chart5.setOption(this.optionChart.chart5)

        let clientTotal = 0, total = 0, char6Index = 0
        let t5Data = [{stage: '1-前期接触', number: 0, total: 0}, {stage: '2-需求调查', number: 0, total: 0}, {stage: '3-提出方案', number: 0, total: 0}, {stage: '4-报价', number: 0, total: 0}, {stage: '5-商务合同', number: 0, total: 0}, {stage: '6-成功签约', number: 0, total: 0}, {stage: '7-回款金额', number: 0, total: 0}, {stage: '合计', number: 0, total: 0}]
        let chart6Vla = [{value: 0, name:'1-前期接触'}, {value:0, name:'2-需求调查'}, {value:0, name:'3-提出方案'}, {value:0, name:'4-报价'}, {value:0, name:'5-商务合同'}, {value:0, name:'6-成功签约'}, {value:0, name:'7-回款金额'}]
        for(let k in data.salesFunnels){
          clientTotal += data.salesFunnels[k][1]
          total += data.salesFunnels[k][0]
          t5Data[char6Index].number = data.salesFunnels[k][1]
          t5Data[char6Index].total = data.salesFunnels[k][0]
          chart6Vla[char6Index].value = data.salesFunnels[k][0]
          char6Index++
        }
        t5Data[7].number = clientTotal
        t5Data[7].total = total
        this.t5Data = t5Data
        this.optionChart.chart6.series[0].data = chart6Vla
        this.charts.chart6.setOption(this.optionChart.chart6)
      },
      _getQuarter() {
        let quarter = this.quarter * 3
        return [quarter-2+"", quarter-1+"", quarter+""]
      },
      _getClass(params){
        return this.year == new Date().getFullYear() && this.t4Data[0]['weeks' + (params.index)] && this.t4Data[0]['weeks' + (params.index)] > this.nowWeek ? 'c5' : ''
        // return this.year == new Date().getFullYear() && this.t4Weeks[params.index-1] > this.weekIndexInYear() ? 'c5' : ''
      },
      _getParseDay(day){
        let days = day.split("-")
        return days[1] + '.' + days[2]
      },
      rowClassName (row, index) {
        if (index === 7)  return 'table-total-row'
        return ''
      }
    },
    components: {
      vSelect
    }
  }
</script>

<style>

  .ivu-table .table-total-row td{
    background-color: #f8f8f9;
  }

</style>
