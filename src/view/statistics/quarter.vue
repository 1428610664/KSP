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
        <span>选择部门：</span>
        <Select v-model="departmentIds" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>负责人：</span>
        <Select v-model="principal" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>选择产品线：</span>
        <Select v-model="proIds" :multiple="true" :filterable="true" style="width:160px">
          <Option v-for="item in products" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button type="primary" @click="searchEvent">查询</Button>
      </div>
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
  </div>
</template>

<script>

  require('echarts/theme/macarons')

  export default {
    name: "index",
    data() {
      return {
        principal: [],
        departmentIds: [],
        proIds: [],
        quarter: '',
        year: '',
        requestParam: {
          year: '',
          quarter: '',
          principal: '',
          departmentIds: '',
          proIds: '',
          limit: 20,
          offset: 1
        },
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

          { title: '季度任务（万元）', align: 'center',
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
          { title: '商机统计（万元）', align: 'center',
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
            title: '月度任务（万元）', align: 'center',
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

        charts: {},
      }
    },
    created() {
      this.$nextTick(() => {
        this.initParams()
        this.initChart()
        this.resizeChart()
        this.requestCommons()
        this.requestData()
      })
    },
    methods: {
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
        this.requestParam.departmentIds = this.departmentIds.join(',')
        this.requestParam.proIds = this.proIds.join(',')
        this.requestParam.principal = this.principal.join(',')
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
            this._parseData(res.data)
          }
        })
      },
      requestCommons(){
        this.requestCommon({queryDepartment: true,queryUsers: true,queryProduct: true}, (res)=> {
          if(res.success) {
            this.departments = res.data.departments
            this.products = res.data.products
            this.userList= res.data.users
          }
        })
      },
      initChart(){
        this.charts.chart1 = this.$echarts.init(document.getElementById('chart1'), 'macarons')
        this.charts.chart2 = this.$echarts.init(document.getElementById('chart2'), 'macarons')
        this.charts.chart3 = this.$echarts.init(document.getElementById('chart3'), 'macarons')
        this.charts.chart4 = this.$echarts.init(document.getElementById('chart4'), 'macarons')
        this.charts.chart5 = this.$echarts.init(document.getElementById('chart5'), 'macarons')

        let optionChart1 = {
          color: ['#2ec7c9', '#b6a2de'],
          title: {text: '季度任务',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
          tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
          legend: {data: ['季销售任务', '季完成任务'], top: 24},
          grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true },
          xAxis: {type: 'category',data: ['销售回款','销售订单','销售毛利']},
          yAxis: {type: 'value',boundaryGap: [0, 0.01]},
          series: [
            {name: '季销售任务',type: 'bar',barWidth: 20,animationDuration: 2800, animationEasing: 'cubicInOut',
              data: [170, 134, 630]},
            {name: '季完成任务',type: 'bar',barWidth: 20,animationDuration: 2800, animationEasing: 'quadraticOut',
              data: [121, 131, 607]}
          ]
        },
          optionChart2 = {
            color: ['#2ec7c9', '#ffb980', '#d87a80'],
            title: {text: 'FY12Q1 - 商机明细表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
            tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
            legend: {data: ['75%&90%', '50%', '10%&25%'], top: 24},
            grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
            xAxis: {type: 'category',data: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13']},
            yAxis: {type: 'value',boundaryGap: [0, 0.01]},
            series: [{name: '75%&90%',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut',
                data: [170, 134, 630,170, 134, 630,170, 134, 630,170, 134, 630,170]
              },{name: '50%',type: 'bar',animationDuration: 2800, animationEasing: 'quadraticOut',
                data: [121, 131, 607,121, 131, 607,121, 131, 607,121, 131, 607,121]
              },{  name: '10%&25%',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut',
                data: [121, 131, 607,121, 131, 607,121, 131, 607,121, 131, 607,121]
              }
            ]
          },
          optionChart3 = {
            title: {text: 'FY12Q1 - 周销售进度表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
            tooltip: {trigger: 'axis',axisPointer: {type: 'cross'},padding: [5, 10]},
            legend: {data:['BGT','QTD'], top: 24},
            grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
            xAxis: {type: 'category',boundaryGap: false,
              data: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13']
            },
            yAxis: {type: 'value'},
            series: [{name:'BGT',type:'line',smooth: true,stack: '总量',animationDuration: 2800, animationEasing: 'cubicInOut',
                data:[120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230]
              },{name:'QTD',type:'line',smooth: true,stack: '总量',animationDuration: 2800, animationEasing: 'quadraticOut',
                data:[220, 182, 191, 234, 290, 330, 310,120, 132, 101, 134, 90, 230]
              }
            ]
          },
          optionChart4 = {
            color: ['#2ec7c9', '#ffb980'],
            title: {text: 'FY12Q1 - 月销售进度表',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
            tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
            legend: {data: ['预算', 'QTD'], top: 24},
            grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
            xAxis: {type: 'category',data: ['销售回款','销售订单','销售毛利']},
            yAxis: {type: 'value',boundaryGap: [0, 0.01]},
            series: [
              {name: '预算',type: 'bar',animationDuration: 2800, animationEasing: 'cubicInOut',barWidth: 20,data: [170, 134, 630]},
              {name: 'QTD',type: 'bar',animationDuration: 2800, animationEasing: 'quadraticOut', barWidth: 20,data: [121, 131, 607]}
            ]
          },
          optionChart5 = {
            title: {text: '当月销售趋势图',top: 4, left: 12,textStyle: {fontSize: 15, color: '#515a6e'}},
            tooltip: {trigger: 'axis',axisPointer: {type: 'cross'},padding: [5, 10]},
            legend: {data:['回款','订单','毛利'], top: 24},
            grid: {left: '3%',right: '4%',bottom: '3%',containLabel: true},
            xAxis: {type: 'category',boundaryGap: false,data: ['8.1','8.2','8.3','8.4','8.5','8.6','8.7']},
            yAxis: {type: 'value'},
            series: [
              {name:'回款',type:'line',smooth: true,stack: '总量',animationDuration: 2800, animationEasing: 'cubicInOut',data:[120, 132, 101, 134, 90, 230, 210]},
              {name:'订单',type:'line',smooth: true,stack: '总量',animationDuration: 2800, animationEasing: 'quadraticOut',data:[220, 182, 191, 234, 290, 330, 310]},
              { name:'毛利',type:'line',smooth: true,stack: '总量',animationDuration: 2800, animationEasing: 'backOut',data:[150, 232, 201, 154, 190, 330, 410]}
            ]
          }

        this.charts.chart1.setOption(optionChart1)
        this.charts.chart2.setOption(optionChart2)
        this.charts.chart3.setOption(optionChart3)
        this.charts.chart4.setOption(optionChart4)
        this.charts.chart5.setOption(optionChart5)
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

        if(!data) {
          this.t1Data = [{name: '收款', a: 0,b: 0, c: 0}, {name: '毛利', a: 0,b: 0, c: 0}]
          this.t2Data = [{a: 0, b: 0,c: 0, d: 0}]
          this.t3Data = t3Data
          this.t4Data = t4Data
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
          t4Data[0]['w'+ _i] = data.rlsWeek[k].salesVolume.toFixed(2)
          t4Data[1]['w'+ _i] = data.rlsWeek[k].grossProfit.toFixed(2)
          t4Data[2]['w'+ _i] = data.rlsWeek[k].salesVolumeRatio.toFixed(2) + '%'
          _i++
        }
        this.t4Weeks = t4Weeks
        this.t4Data = t4Data
      },
      _getQuarter() {
        let quarter = this.quarter * 3
        return [quarter-2+"", quarter-1+"", quarter+""]
      },
      _getClass(params){
        return this.year == new Date().getFullYear() && this.t4Weeks[params.index-1] > this.weekIndexInYear() ? 'c5' : ''
      }
    }
  }
</script>

<style scoped>

</style>
