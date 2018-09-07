<!--
表单组件
-->
<style scoped>
  .inputForm .ivu-col{margin-top:5px;margin-bottom: 5px;}
  .inputForm .ivu-col p{line-height: 30px}
  .talbeDetails .td{padding-left: 6px;  border: 1px solid #cccccc;}
  .talbeDetails .td-c{background-color: #F0F0EE;}
  .red_tip{display: inline-block; width:10px; height: 20px; color: #FF0000;vertical-align: sub;}
</style>
<template>
  <Modal
    :title="options.title"
    v-model="isShowModal"
    :mask-closable="false"
    @on-cancel="cancel"
    class-name="vertical-center-modal inputForm bottom inputFormFile" :width="options.width">
    <div>
      <div>
      <div v-for="(row ,index) in options.opintions" :key="index">
        <Row :gutter=5>
           <div  v-for="rows in row" :key="rows.title">
             <div v-if="rows.theme" class="m-t10 m-b10">
                 <h3 class="c2" style="font-weight: bold" :style="{textAlign: rows.align ? rows.align: 'left'}">{{rows.title}}</h3>
             </div>
             <div v-else-if="rows.link" class="m-t5 m-b5">
               <v-select :options="rows.linkOpts" :fromVal="fromVal" @change="linkChange" @changeExternal="changeExternal"></v-select>
             </div>
              <div v-else>
                <i-col :span="rows.titlespan">
                  <p class="width-right m-l10"><span class="red_tip">{{rows.required ? '*' : ''}}</span>{{rows.title}}</p>
                </i-col>
                <i-col :span="rows.colspan">

                  <InputNumber style="width: 100%" v-if="rows.type=='InputNumber'" :max="rows.max" :min="rows.min" :readonly="rows.readonly"
                               :placeholder="rows.required ? '请输入...(必填）':'请输入...'"
                               v-model="fromVal[rows.id]"></InputNumber>
                  <InputNumber style="width: 100%" v-if="rows.type=='InputNumberMoney'" :max="rows.max" :min="rows.min" :readonly="rows.readonly"
                               :placeholder="rows.required ? '请输入...(必填）':'请输入...'"
                               :formatter="value => `${value}`.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')"
                               v-model="fromVal[rows.id]" @on-change="moneyChange(arguments[0],rows)"></InputNumber>

                  <InputNumber style="width: 100%" v-if="rows.type=='InputNumberPercent'" :max="maxIpnut[rows.id]"
                               :min="rows.min" :placeholder="rows.required ? '请输入...(必填）':'请输入...'"
                               v-model="fromVal[rows.id]"></InputNumber>
                  <i-input type="text" v-if="rows.type=='bankCard'"
                           :placeholder="rows.required ? '请输入...(必填）':'请输入...'"
                           v-model="fromVal[rows.id]"
                           :disabled="rows.disabled"
                           :maxlengh="rows.maxLength!=undefined ? rows.maxLength: 50" @on-blur="bankCardChange(rows)"></i-input>

                  <i-input type="text" v-if="rows.type=='input'"
                           :placeholder="rows.readonly ? '' : rows.required ? '请输入...(必填）':'请输入...'"
                           v-model="fromVal[rows.id]"
                           :disabled="rows.disabled"
                           :readonly="rows.readonly"
                           :maxlength="rows.maxLength!=undefined ? rows.maxLength: 50"></i-input>
                  <i-input type="password" v-if="rows.type=='passWord'"
                           :placeholder="rows.required ? '请输入...(必填）':'请输入...'"
                           v-model="fromVal[rows.id]"
                           :disabled="rows.disabled"
                           :maxlength="rows.maxLength!=undefined ? rows.maxLength: 50"></i-input>

                  <i-input v-if="rows.type=='textarea'"
                           v-model="fromVal[rows.id]"
                           type="textarea"
                           :rows="rows.rowsNub"
                           :disabled="rows.disabled"
                           :readonly="rows.readonly"
                           :placeholder="rows.readonly ? '' : rows.required ? '请输入...(必填）':'请输入...'"></i-input>

                  <Dropdown v-if="rows.type=='dropDown'" trigger="click" style="width: 100%"
                            @on-click="clickDropDown(arguments[0], rows.id)">
                    <i-input type="text" placeholder="请输入或选择类型..." v-model="fromVal[rows.id]" :maxlength="10"></i-input>
                    <DropdownMenu slot="list">
                      <DropdownItem v-for="item in select[rows.id]" :name="item.value" :key="item.value">{{item.label }}&nbsp;({{item.value}})
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <v-address v-if="rows.type=='address'" v-model="fromVal[rows.id]"></v-address>

                  <v-tree v-if="rows.type=='tree'" :data='fromVal[rows.id]' :multiple='false'></v-tree>

                  <Select v-if="rows.type=='select'&& rows.relation!=''"
                          v-model="fromVal[rows.id]"
                          :placeholder="rows.required ? '请选择(必选）':'请选择'"
                          :disabled="rows.disabled"
                          @on-change="selectChange(arguments[0], rows.relation)"
                          :filterable="rows.filterable"
                          :placement="placement">
                    <Option v-for="item in select[rows.id]" :value="item.value" :key="item.value">{{ item.label }}
                    </Option>
                  </Select>

                  <Select v-if="rows.type=='select'&& rows.relation==''"
                          v-model="fromVal[rows.id]"
                          :placeholder="rows.required ? '请选择(必选）':'请选择'"
                          :disabled="rows.disabled"
                          :id="rows.id"
                          :filterable="rows.filterable"
                          :placement="placement">
                    <Option v-for="item in select[rows.id]" :value="item.value" :key="item.value">{{ item.label }}
                    </Option>
                  </Select>
                  <Select v-if="rows.type=='select-opts'"
                          v-model="fromVal[rows.id]"
                          :placeholder="rows.required ? '请选择(必选）':'请选择'"
                          :disabled="rows.disabled"
                          :id="rows.id"
                          :filterable="rows.filterable"
                          @on-change="customSelectChange(arguments[0], rows)"
                          :placement="placement">
                    <Option v-for="item in rows.select" :value="item.value" :key="item.value">{{ item.label }}
                    </Option>
                  </Select>

                  <div v-if="rows.type=='radio'" style="height: 32px;padding: 5px">
                    <RadioGroup v-model="fromVal[rows.id]" size="large">
                      <Radio v-for="item in radios[rows.id]" :label="item.value" :key="item.value">{{item.name}}</Radio>
                    </RadioGroup>
                  </div>
                  <div v-if="rows.type=='checkbox'" style="height: 32px;padding: 5px">
                    <CheckboxGroup v-if="rows.checkboxes" v-model="fromVal[rows.id]">
                      <Checkbox v-for="(item, index) in rows.checkboxes" :label="item.value" :key="index">{{item.name}}</Checkbox>
                    </CheckboxGroup>
                    <CheckboxGroup v-else v-model="fromVal[rows.id]">
                      <Checkbox v-for="item in checkboxes[rows.id]" :label="item.value" :key="item.value"></Checkbox>
                    </CheckboxGroup>
                  </div>
                  <Select v-if="rows.type=='selectMultiple'"
                          multiple
                          v-model="fromVal[rows.id]"
                          :placeholder="rows.required ? '请选择(可多选,必选)':'请选择(可多选)'"
                          :filterable="rows.filterable"
                          @on-change="selectChange(arguments[0], rows.relation)"
                          :placement="placement">
                    <Option v-for="item in select[rows.id]" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
                  <div v-if="rows.type=='file'">
                    <div class="fbox">
                      <div>
                        <Upload :action="getWbkUrl('upload')" :before-upload="(file)=>{handleUpload(file,rows.id);return false}" :accept="rows.accept">
                          <Button>选择文件</Button>
                        </Upload>
                      </div>
                      <div class="flex">
                        <div class="m-l5" style="line-height: 32px;">
                          <span class="in-line">{{ fromVal[rows.id] == '' ? '未选择文件' : fromVal[rows.id].name }}</span>
                          <!--&nbsp;&nbsp;<a v-if="fromVal[rows.id] != ''" @click="deleteFile(rows.id)">删除</a>-->
                          &nbsp;&nbsp;<a v-if="fromVal[rows.id] != ''" @click="fromVal[rows.id] = ''">删除</a>
                        </div>
                      </div>
                    </div>
                    <!--<Upload class="in-line" :action="getWbkUrl('upload')" :before-upload="(file)=>{handleUpload(file,rows.id);return false}">-->
                      <!--<Button>选择文件</Button>-->
                    <!--</Upload>-->
                    <!--<div class="in-line td-render" style="height:32px; line-height:32px;width: calc(100% - 90px)" -->
                         <!--:title="fromVal[rows.id].name">{{ fromVal[rows.id].name }}</div>-->
                  </div>
                  <div v-if="rows.type=='time'" class="ivu-input-wrapper ivu-input-type">
                    <i class="ivu-icon ivu-icon-ios-calendar-outline ivu-input-icon ivu-input-icon-normal"></i>
                    <input :id="rows.id" :value="fromVal[rows.id]" :disabled="rows.disabled" :readonly="rows.readonly" autocomplete="off" spellcheck="false" type="text"
                           :placeholder="rows.required ? '请选择日期和时间(必选）':'请选择日期和时间'"
                           class="ivu-input" @click='initTime(rows)'>
                  </div>
                  <div v-if="rows.type=='tip'" class="l-h30">{{rows.name}}{{fromVal[rows.id]}} 元  <span class="c3">(按照提现金额收取15%的手续费)</span> <span v-if="enough" class="c1">余额不足</span></div>
                </i-col>
              </div>
            </div>
        </Row>
      </div>
      </div>
      <div><slot name="custom"></slot></div>
      <div><slot name="table"></slot></div>
    </div>
    <div slot="footer">
      <Button type="ghost" @click="cancel">{{options.cancelText ? options.cancelText : '取消'}}</Button>
      <Button v-for="item in options.button" :type="item.type" @click="handle(item.click)" :disabled="disabledButton|| enough" :key="item.title">{{item.title}}</Button>
    </div>
  </Modal>
</template>
<script>

  import utils from 'common/js/utils'
  import bankData from 'common/js/bankData/bankData.json'
  import vAddress from 'components/address'
  import vSelect from 'components/select'

  export default {
    data () {
      return {
        clear: false,
        editable: false,
        labelInValue: true,
        disabledButton: this.modalDisabled,
        isShowModal: this.modalshow,
        opinions: '',
        messages: '',
        enough: false,
        placement: 'bottom',
        select: {
          sex: [{value:'男',label:'男'},{value:'女',label:'女'}],
          rad: [{value:'R1',label:'R1'},{value:'R2',label:'R2'},{value:'R3',label:'R3'},{value:'A1',label:'A1'},{value:'A2',label:'A2'},{value:'A3',label:'A3'},{value:'D1',label:'D1'},{value:'D2',label:'D2'},{value:'D3',label:'D3'}],
          type: [{value:'0',label:'【枚举值维护】'},{value:'1',label:'渠道用户'},{value:'2',label:'终端用户'}],
          grade: [{value: '0', label: '枚举值维护'}, {value: '1', label: '支持'}, {value: '2', label: '一般'}, {value: '3', label: '中立'}, {value: '4', label: '反对'}],
          decisionRole: [{value: '0', label: '枚举值维护'}, {value: '1', label: '决策者'}, {value: '2', label: '影响者'}, {value: '3', label: '使用者'}, {value: '4', label: '内线'}, {value: '5', label: '关键人'}],
          activityMode: [{value: '0', label: '枚举值维护'}, {value: '1', label: '电话'}, {value: '2', label: '网络'}, {value: '3', label: '拜访'}],
          channel: [{value:'0',label:'人工创建'},{value:'1',label:'EXCEL导入'},{value:'2',label:'微信生成'},{value:'3',label:'邀请生成'}],
          status: [{value:0,label:'禁用'},{value:1,label:'启用'}],
          role: [{value:0,label:'普通用户'},{value:1,label:'活动管理员'},{value:98,label:'运营管理员'},{value:99,label:'平台管理员'}],
          level: [{value:'0',label:'非会员'},{value:'1',label:'会员'}],
          bank: []
        },
        radios: {
          checked: [{value:'1',name:'通过'},{value:'-1',name:'不通过'}],
          status: [{value: '0', name: '禁用'}, {value: '1', name: '启用'}],
          importance: [{value: '0', name: '无'}, {value: '1', name: '精选'}, {value: '2', name: '推荐'}]
        },
        checkboxes: {
          check: [{value: 'true', name: '是'}, {value: 'false', name: '否'}],
          importance: [{value: '精选', name: '1'}, {value: '推荐', name: '2'}]
        },
        timer: '',
        fromVal: this.value,
        parentIdRow: ''
      }
    }, // 参数
    mounted () {
    },
    beforeCreate () {
      this.$nextTick(() => {
        this.initSelect()
      })
    }, // 数据加载前触发
    props: {
      modalshow: '',
      options: '',
      value: '',
      modalDisabled: ''
    },
    watch: {
      /**
       *实时监控modals显示影藏传值是否变动
       * @param val
       */
      modalshow (val) {
        this.isShowModal = val // 新增modalshow的watch，监听变更并同步到isShowModal上
        if (val) {
          this.disabledButton = false
        }
      },
      /**
       *绑定modal显示参数，与父组件同步
       * @param val
       */
      value (val) {
        this.fromVal = val // 新增modalshow的watch，监听变更并同步到isShowModal上
        this.initSelect()
      },

      modalDisabled (val) {
        console.log("modalDisabled---------"+val)
        this.disabledButton = val
      }
    },
    computed: {},
    methods: {
      initSelect () {
        for (let test in this.options.selectAjax) {
          let newRow = this.options.selectAjax[test]
          switch (newRow) {
            case 'parentId': // 父对象
              break
            default:
          }
        }
        this.initModalSelectScroll()
        this.initModalScroll()
      },

      /**
       *点击下拉菜单触发事件
       */
      clickDropDown (name, id) {
        this.fromVal[id] = name
      },

      /**
       *点击自定义按钮时触发
       * @param event
       */
      handle (event) {
        let nonEmpty = true
        for (let item of this.options.opintions) {
          let itemFor = true
          for (let v of item) {
            if (v.required && utils.isEmpty(this.fromVal[v.id])) {
              this.$Message.error(v.title + '不能为空')
              nonEmpty = false
              itemFor = false
              break
            }
            if(v.linkOpts) {
              if (v.linkOpts[0].required && utils.isEmpty(this.fromVal[v.linkOpts[0].id])) {
                this.$Message.error(v.linkOpts[0].title + '不能为空')
                nonEmpty = false
                itemFor = false
                break
              }
              if (v.linkOpts[1].required && utils.isEmpty(this.fromVal[v.linkOpts[1].id])) {
                this.$Message.error(v.linkOpts[1].title + '不能为空')
                nonEmpty = false
                itemFor = false
                break
              }
            }

            if(v.required && v.type == 'address') {
              if(utils.isEmpty(this.fromVal[v.id].city1) || utils.isEmpty(this.fromVal[v.id].city2) || utils.isEmpty(this.fromVal[v.id].city3)) {
                this.$Message.error('请选择' +v.title)
                nonEmpty = false
                itemFor = false
                break
              }
            }
            if (v.valueType !== undefined && this.fromVal[v.id] !== '') {
              let testValue = false
              // 验证ip格式
              if (this.fromVal[v.id] && v.valueType === 'ip' && !utils.isIp(this.fromVal[v.id])) {
                  testValue = true
              }
              // 验证固定电话格式
              if (this.fromVal[v.id] && v.valueType === 'telephone' && !utils.isMobile(this.fromVal[v.id])) {
                  testValue = true
              }
              // 验证手机号格式
              if (this.fromVal[v.id] && v.valueType === 'mobilePhone' && utils.isPhone(this.fromVal[v.id])) {
                  testValue = true
              }
              // 验证身份证号格式
              if (this.fromVal[v.id] && v.valueType === 'idCard' && !utils.IdentityCodeValid(this.fromVal[v.id])) {
                  testValue = true
              }
              // 验证邮箱格式
              if (this.fromVal[v.id] && v.valueType === 'email' && !utils.isEmail(this.fromVal[v.id])) {
                testValue = true
              }
              // 验证银行卡
              if (this.fromVal[v.id] && v.valueType === 'bankCheck' && !utils.bankCheck(this.fromVal[v.id])) {
                testValue = true
              }
              if (testValue) {
                this.$Message.error(v.title + '输入格式不合理')
                this.fromVal[v.id] = ''
                nonEmpty = false
                itemFor = false
                break
              }
            }
          }
          if (!itemFor) {
            break
          }
        }

        if (nonEmpty) {
          // this.disabledButton = true
          this.$emit('changeOptions', this.fromVal) // 双向绑定传值
        }
      },
      /**
       * 联动数据变动
       */
      linkChange(id, v){
        this.fromVal[id] = v
      },
      /**
       * 外部监听
       */
      changeExternal(id, v){
        this.$emit(v, id)
      },

      /**
       *点击取消时触发
       */
      cancel () {
        this.$emit('changeOptions', this.fromVal, 'cancel')
      },

      /**
       *时间处理
       * @param date
       * @param id
       * @param children
       */
      handleChange (date, id, children) {
        if (date !== 'clear') {
          if (children) {
            this.fromVal[id][children] = date
          } else {
            this.fromVal[id] = date + ' 00:00:00'
          }
        } else {
          this.fromVal[id] = ''
        }
      },

      /**
       *下拉改变是触发中转站
       * @param val
       * @param relation
       */
      selectChange (val, relation) {
        this.loadSelect(val, relation)
      },

      /**
       * 下拉数据关联变动处理并调用对应的请求
       * @param name
       * @param relation
       * @param change
       */
      loadSelect (name, relation) {
        switch ('' + relation) {
          case 'typeObj': // 新增对象类型
            break
          default:
        }
      },
      /**
       * 自定义下拉触发事件
       * @param val
       * @param row
       * @param change
       */
      customSelectChange(val, row){
        if(row.change) this.$emit(row.change, val)
      },
      /**
       * 百分比填写时限制
       * @param value
       * @param id
       * @param percentId
       */
      percentCheckboxChange (value, id, percentId) {
        if (value) {
          this.maxIpnut[id] = 100
          if (this.fromVal[id] > 100) {
            this.fromVal[id] = 100
          }
          this.fromVal[percentId] = 1
        } else {
          this.maxIpnut[id] = Infinity
          this.fromVal[percentId] = 0
        }
      },
      /**
       * 时间框架初始化
       * @param bId
       */
      initTime (row) {
        let _this = this,
          _min = row.minDate ? this.getTimeString(row.minDate, 'min') : '',
          _max = row.maxDate ? this.getTimeString(row.maxDate, 'max') : ''
        WdatePicker({
          el: '' + row.id,
          dateFmt: row.format ? row.format : 'yyyy-MM-dd HH:mm:ss',
          autoPickDate: false,
          maxDate: _max,
          minDate: _min,
          onpicking: function (dp) {
            _this.fromVal[row.id] = dp.cal.getNewDateStr()
          }
        })
      },
      /**
       *获取限制时间字符串
       * @param str
       * @param type
       * @returns {string}
       */
      getTimeString (str, type) {
        if (!str) {
          return type == 'max' ? '' : '%y-%M-%d %H:%m:%s'
        }
        let _arr = str.split(',')
        let newStr = '#F{'
        for (let i = 0; i < _arr.length; i++) {
          let num = i + 1
          if (type == 'max' && num == _arr.length) {
            newStr = newStr + '$dp.$D(\'' + _arr[i] + '\')}'
          } else {
            newStr = newStr + '$dp.$D(\'' + _arr[i] + '\')||'
          }
        }
        if (type == 'min') {
          newStr = newStr + '\'%y-%M-%d %H:%m:%s\'}'
        }
        return newStr
      },
      moneyChange (val, row) {
        if (val == 0) {
          this.fromVal[row.relation] = 0
        } else {
          this.fromVal[row.relation] = Math.round((val * 0.15) * 100) / 100
        }
        if ((this.fromVal[row.relation] + val) <= row.max) {
          this.enough = false
        } else {
          this.enough = true
        }
      },
      bankCardChange (rows) {
        if (this.fromVal[rows.id] == '') return
        let bankCard = this.fromVal[rows.id]
        if (rows.valueType === 'bankCheck' && utils.bankCheck(this.fromVal[rows.id])) {
          let bankBin = 0
          let isFind = false
            for (let key = 10; key >= 2; key--) {
              bankBin = bankCard.substring(0, key)
              for (let i = 0; i < bankData.length; i++) {
                if (bankData[i].bin == bankBin) {
                  isFind = true
                  this.fromVal[rows.relation] = bankData[i].bankName
                }
              }
              if (isFind) { break }
            }
            if (!isFind) {this.fromVal[rows.relation] = '未知' }
        } else {
          this.$Message.error('银行卡卡号格式不正确')
          this.fromVal[rows.id] = ''
          this.fromVal[rows.relation] = ''
        }
      },
      handleUpload (file, id) {
       this.fromVal[id] = file
        return false
      },
      deleteFile (id) {
        this.fromVal[id] = ''
      }
    },
    components: {
      vAddress,
      vSelect
    }
  }
</script>
<style>
  .inputFormFile .ivu-upload-list{ margin-top: 0!important;}
</style>
