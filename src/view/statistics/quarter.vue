<template>
  <div class="wrapper b wrapper-box m-10">
    <div class="clear">
      <div class="fr c3">
        <Select v-model="requestParam.year" style="width:120px">
          <Option v-for="item in yearList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Select v-model="requestParam.quarter" style="width:80px" class="m-r5">
          <Option v-for="item in quarterList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>选择部门：</span>
        <Select v-model="department" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in departments" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>负责人：</span>
        <Select v-model="principal" :multiple="true" :filterable="true" style="width:160px" class="m-r5">
          <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>选择产品线：</span>
        <Select v-model="product" :multiple="true" :filterable="true" style="width:160px">
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
          <div id="chart3" style="width: 100%; height: 480px"></div>
        </div>
        <div class="flex">
          <div id="chart4" style="width: 100%; height: 480px"></div>
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
        department: [],
        product: [],
        requestParam: {
          principal: '',
          year: '2018',
          quarter: 'Q1',
          department: '',
          product: '',
          limit: 20,
          offset: 1
        },
        yearList: [{value: '2018', label: '2018'},{value: '2017', label: '2017'},{value: '2016', label: '2016'},{value: '2015', label: '2015'}],
        quarterList: [{value: 'Q1', label: 'Q1'},{value: 'Q2', label: 'Q2'},{value: 'Q3', label: 'Q3'},{value: 'Q4', label: 'Q4'}],

        departments: [],  // 部门
        products: [],     // 产品
        userList: [],     // 负责人

        t1Data: [
          {name: '收款', start_RAD_BP: 1,end_RAD_BP: 2},
          {name: '毛利', start_RAD_BP: 11,end_RAD_BP: 22}
        ],
        t1Columns: [

          { title: '季度任务（万元）', align: 'center',
            children: [
              { title: ' ', key: 'name', align: 'center'},
              {
                title: '销售任务',
                key: 'start_RAD_BP',
                align: 'center',
              },{
                title: '完成任务',
                key: 'end_RAD_BP',
                align: 'center',
              },{
                title: '完成比例',
                key: 'end_RAD_BP',
                align: 'center',
              }]
          }
        ],
        t2Data: [
          {name: 1, start_RAD_SOW: 1,end_RAD_SOW: 2},
          {name: 11, start_RAD_SOW: 11,end_RAD_SOW: 22}
        ],
        t2Columns: [
          { title: '商机统计（万元）', align: 'center',
            children: [
              {
                title: '绿（75%~90%）',
                key: 'start_RAD_SOW',
                align: 'center',
              },{
                title: '黄（50%）',
                key: 'end_RAD_SOW',
                align: 'center',
              },{
                title: '红（10%~25%）',
                key: 'end_RAD_SOW',
                align: 'center',
              },{
                title: '合计',
                key: 'end_RAD_SOW',
                align: 'center',
              }]
          }
        ],
        t3Data: [
          {name: '收款', start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
          {name: '毛利', start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222}
        ],
        t3Columns: [
          {
            title: '月度任务（万元）', align: 'center',
            children: [{ title: ' ', key: 'name', align: 'center', width: 120 },
              { title: 'M1（1月）', align: 'center',
                children: [
                  {
                    title: '销售任务',
                    key: 'start_RFM_R',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'end_RFM_R',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'end_RFM_R',
                    align: 'center',
                  }]
              },
              { title: 'M2（2月）', align: 'center',
                children: [
                  {
                    title: '销售任务',
                    key: 'start_RFM_R',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'end_RFM_R',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'end_RFM_R',
                    align: 'center',
                  }]
              },
              { title: 'M3（3月）', align: 'center',
                children: [
                  {
                    title: '销售任务',
                    key: 'start_RFM_R',
                    align: 'center',
                  },{
                    title: '完成任务',
                    key: 'end_RFM_R',
                    align: 'center',
                  },{
                    title: '完成比例',
                    key: 'end_RFM_R',
                    align: 'center',
                  }]
              }]
          }
        ],
        t4Data: [
          {name: '收款', start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
          {name: '毛利', start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
          {name: '完成比例', start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
        ],
        t4Columns: [
          {
            title: '过程管理', align: 'center',
            children: [{ title: '进程管理', key: 'name', align: 'center', width: 120 },
              {
                title: '第1周',
                key: 'start_RFM_R',
                align: 'center',
              },{
                title: '第2周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第3周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第4周',
                key: 'start_RFM_R',
                align: 'center',
              },{
                title: '第5周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第6周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第7周',
                key: 'start_RFM_R',
                align: 'center',
              },{
                title: '第8周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第9周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第10周',
                key: 'start_RFM_R',
                align: 'center',
              },{
                title: '第11周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第12周',
                key: 'end_RFM_R',
                align: 'center',
              },{
                title: '第13周',
                key: 'start_RFM_R',
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
        this.initChart()
        this.resizeChart()
        this.requestCommons()
      })
    },
    methods: {
      searchEvent() {
        this.requestParam.limit = 20
        this.requestParam.offset = 1
        this.requestParam.department = this.department.join(',')
        this.requestParam.product = this.product.join(',')
        this.requestParam.principal = this.principal.join(',')
        this.requestData()
      },
      requestData(){

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
      }
    }
  }
</script>

<style scoped>

</style>
