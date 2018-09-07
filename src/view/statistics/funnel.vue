<template>
  <div class="wrapper b wrapper-box m-10">

    <Row>
      <i-col span="14">
        <i-table :columns="columns" :data="data" border size="small"></i-table>
      </i-col>
      <i-col span="10">
        <div id="chart1" style="width: 100%; height: 355px"></div>
      </i-col>
    </Row>

  </div>
</template>

<script>

  require('echarts/theme/macarons')

  export default {
    name: "index",
    data() {
      return {
        data: [
          {stage: '1-前期接触', number: 10, total: 100},
          {stage: '2-需求调查', number: 10, total: 100},
          {stage: '3-提出方案', number: 13, total: 100},
          {stage: '4-报价', number: 6, total: 100},
          {stage: '5-商务合同', number: 1, total: 100},
          {stage: '6-成功签约', number: 0, total: 100},
          {stage: '7-回款金额', number: 0, total: 100},
          {stage: '合计', number: 40, total: 600},
        ],
        columns: [
          {title: '阶段', show: true, key: 'stage', minWidth: 160, sortable: false, render: this.tdRender},
          {title: '客户数量', show: true, key: 'number', width: 100, sortable: false, render: this.tdRender},
          {title: '预计额', show: true, key: 'total', width: 140, sortable: false, render: this.tdRender},
        ],

        charts: {},
        optionChart: {}
      }
    },
    created() {
      this.$nextTick(() => {
        this.initChart()
        this.resizeChart()
      })
    },
    methods: {
      initChart(){
        this.charts.chart1 = this.$echarts.init(document.getElementById('chart1'), 'macarons')

        this.optionChart.chart1 = {
          tooltip : {
            trigger: 'item',
            formatter: "{b} : {c}%"
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
              maxSize: '80%',

              data:[
                {value:100, name:'1-前期接触'},
                {value:80, name:'2-需求调查'},
                {value:60, name:'3-提出方案'},
                {value:40, name:'4-报价'},
                {value:20, name:'5-商务合同'},
                {value:20, name:'6-成功签约'},
                {value:10, name:'7-回款金额'},
              ]
            }
          ]
        }
        this.charts.chart1.setOption(this.optionChart.chart1)
      },
      resizeChart(){
        window.onresize = () => {
          for (let k of ['chart1']){
            this.charts[k].resize()
          }
        }
      },
    }
  }
</script>

<style scoped>

</style>
