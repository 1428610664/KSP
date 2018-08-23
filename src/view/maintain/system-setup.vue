<template>
  <div class="wrapper b wrapper-box m-10">
    <!--<h2>参数设置</h2>-->
    <div class="c3">
      <h3 class="c2 title">系统参数</h3>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>公司名称：</div>
        </div>
        <div class="item-content flex">
          <Input v-model="fromData.corporateName" placeholder="请输入公司名称..." style="width: 300px" />
        </div>
      </div>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>联系电话：</div>
        </div>
        <div class="item-content flex">
          <Input v-model="fromData.phone" placeholder="请输入联系电话..." style="width: 300px" />
        </div>
      </div>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>邮箱：</div>
        </div>
        <div class="item-content flex">
          <Input v-model="fromData.email" placeholder="请输入邮箱..." style="width: 300px" />
        </div>
      </div>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>企业图标：</div>
        </div>
        <div class="item-content flex">
          <div class="clear">
            <div class="fl" style="width: 300px">
              <div class="img-wrapper">
                <div class="img posct">
                  <img v-if="fromData.logo" width="100%" />
                  <div v-else style="height:150px; line-height: 150px" class="c3 td-render">建议尺寸:750*1334,大小不超过4M</div>
                </div>
              </div>
            </div>
            <div class="fl">
              <div class="m-l20">
                <div class="upload m-t30">
                  <div class="t-indent">
                    <Upload :action="actionUrl"
                            name="file"
                            accept="image/*">
                      <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
                    </Upload>
                  </div>
                  <div class="m-t15">
                    <p class="fz12 l-h20 t-left t-indent">可能会有一定的变形，推荐上传建议尺寸的图片</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>毛利开关：</div>
        </div>
        <div class="item-content flex">
          <RadioGroup v-model="fromData.maori">
            <Radio :label="1">
              <span>启用</span>
            </Radio>
            <Radio :label="0">
              <span>停用</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>费用开关：</div>
        </div>
        <div class="item-content flex">
          <RadioGroup v-model="fromData.cost">
            <Radio :label="1">
              <span>启用</span>
            </Radio>
            <Radio :label="0">
              <span>停用</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>订单开关：</div>
        </div>
        <div class="item-content flex">
          <RadioGroup v-model="fromData.order">
            <Radio :label="1">
              <span>启用</span>
            </Radio>
            <Radio :label="0">
              <span>停用</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>

      <h3 class="c2 title">综合绩效</h3>
      <div class="item-wrapper fbox">
        <div class="item-title posct">
          <div>综合绩效计算方式：</div>
        </div>
        <div class="item-content flex">
          <RadioGroup v-model="fromData.comprehen">
            <Radio :label="1">
              <span>综合绩效</span>
            </Radio>
            <Radio :label="0">
              <span>底薪+提成</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <h3 class="c2 title">RFM参数</h3>
      <div>
        <i-table ref="rfm" :columns="rfmColumns" :data="rfmData"  border size="small"></i-table >
      </div>
      <h3 class="c2 title">RAD参数</h3>
      <Row type="flex">
        <i-col style="padding-right: 5px" :span="12">
          <i-table ref="rad-bp" :columns="bpColumns" :data="bpData"  border size="small"></i-table >
        </i-col >
        <i-col style="padding-left: 5px" :span="12">
          <i-table ref="rad-sow" :columns="sowColumns" :data="sowData"  border size="small"></i-table >
        </i-col >
      </Row>
      <div class="m-t10 ct">
        <Button type="primary">确认</Button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "index",
    data() {
      return {
        value: '',
        actionUrl: '',
        fromData: {
          corporateName: '',
          phone: '',
          email: '',
          logo: '',
          maori: 1,
          cost: 1,
          order: 1,
          comprehen: 1,
        },
        rfmData: [
          {name: 1, start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
          {name: 1, start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222},
          {name: 1, start_RFM_R: 1,end_RFM_R: 2,start_RFM_F: 11,end_RFM_F: 22,start_RFM_M: 111,end_RFM_M: 222}
        ],
        rfmColumns: [
          { title: '值', key: 'name', align: 'center', width: 140 },
          { title: 'RFM-R 最近购买时间参数', align: 'center',
            children: [
              {
                title: '开始值（天）',
                key: 'start_RFM_R',
                align: 'center',
              },{
                title: '结束值（天）',
                key: 'end_RFM_R',
                align: 'center',
              }]
          },
          { title: 'RFM-F 最近1年购买次数', align: 'center',
            children: [
              {
                title: '开始值（次数）',
                key: 'start_RFM_F',
                align: 'center',
              },{
                title: '结束值（次数）',
                key: 'end_RFM_F',
                align: 'center',
              }]
          },
          { title: 'RFM-M 最近1年购买金额（元）', align: 'center',
            children: [
              {
                title: '开始值（金额）',
                key: 'start_RFM_M',
                align: 'center',
              },{
                title: '结束值（金额）',
                key: 'end_RFM_M',
                align: 'center',
              }]
          },
        ],

        bpData: [
          {name: 1, start_RAD_BP: 1,end_RAD_BP: 2},
          {name: 11, start_RAD_BP: 11,end_RAD_BP: 22},
          {name: 111, start_RAD_BP: 111,end_RAD_BP: 222}
        ],
        bpColumns: [
          { title: '值', key: 'name', align: 'center', width: 140 },
          { title: 'RAD-BP 年度采购额或CLV', align: 'center',
            children: [
              {
                title: '开始值（万）',
                key: 'start_RAD_BP',
                align: 'center',
              },{
                title: '结束值（万）',
                key: 'end_RAD_BP',
                align: 'center',
              }]
          }
        ],
        sowData: [
          {name: 1, start_RAD_SOW: 1,end_RAD_SOW: 2},
          {name: 11, start_RAD_SOW: 11,end_RAD_SOW: 22},
          {name: 111, start_RAD_SOW: 111,end_RAD_SOW: 222}
        ],
        sowColumns: [
          { title: '值', key: 'name', align: 'center', width: 140 },
          { title: 'RAD-SOW% 客户覆盖深度', align: 'center',
            children: [
              {
                title: '开始值（%）',
                key: 'start_RAD_SOW',
                align: 'center',
              },{
                title: '结束值（%）',
                key: 'end_RAD_SOW',
                align: 'center',
              }]
          }
        ]
      }
    },
    created() {
      setTimeout(() => {

      }, 20)
    },
    methods: {}
  }
</script>

<style scoped>
  .title{font-weight: bold;padding: 10px 15px}
  .red_tip{display: inline-block; width:10px; height: 20px; color: #FF0000;vertical-align: sub;}
  .img-wrapper{border: 1px solid #dcdee2; padding: 10px;border-radius: 4px}
  .item-wrapper{padding: 5px 0}
  .item-title{ width: 120px;}

</style>
