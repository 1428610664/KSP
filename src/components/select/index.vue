<template>
  <div>
    <Row :gutter=5>
      <div>
        <div>
          <i-col :span="options[0].titlespan">
            <p class="width-right m-l10"><span class="red_tip">{{options[0].required ? '*' : ''}}</span>{{options[0].title}}
            </p>
          </i-col>
          <i-col :span="options[0].colspan">
            <Select v-model="v1"
                    :placeholder="options[0].required ? '请选择(必选）':'请选择'"
                    :disabled="options[0].disabled"
                    :id="options[0].id"
                    :filterable="options[0].filterable"
                    @on-change="customSelectChange(arguments[0], options[0])"
                    placement="bottom">
              <Option v-for="item in select1" :value="item.value" :key="item.value">{{ item.label }}
              </Option>
            </Select>
          </i-col>
        </div>
        <div>
          <i-col :span="options[1].titlespan">
            <p class="width-right m-l10"><span class="red_tip">{{options[1].required ? '*' : ''}}</span>{{options[1].title}}
            </p>
          </i-col>
          <i-col :span="options[1].colspan">
            <Select v-model="v2"
                    :placeholder="options[1].required ? '请选择(必选）':'请选择'"
                    :disabled="options[1].disabled"
                    :id="options[1].id"
                    :filterable="options[1].filterable"
                    placement="bottom">
              <Option v-for="item in select2" :value="item.value" :key="item.value">{{ item.label }}
              </Option>
            </Select>
          </i-col>
        </div>
      </div>
    </Row>
  </div>
</template>

<script>

  let v2 = ''

  export default {
    props: {
      options: '',
      fromVal: ''
    },
    data() {
      return {
        v1: this.fromVal[this.options[0].id],
        v2: this.fromVal[this.options[1].id],
        select1: [],
        select2: []
      }
    },
    watch: {
      v1(v){
        if(v){
          this.v2 = ''
          this.requestVice(v)
          this.$emit('change', this.options[0].id, v)
        }
      },
      v2(v){
        this.$emit('change', this.options[1].id, v)
      },
      options: {
        handler(v) {
          this.v1 = this.fromVal[v[0].id]
          this.v2 = this.fromVal[v[1].id]
          v2 = this.fromVal[v[1].id]
        },
        deep: true
      },
      fromVal: {
        handler(v) {
          if(this.fromVal[this.options[0].id] != this.v1 || this.fromVal[this.options[1].id] != this.v2){
            this.v1 = this.fromVal[this.options[0].id]
            this.v2 = this.fromVal[this.options[1].id]
            v2 = this.fromVal[this.options[1].id]
          }
        },
        deep: true
      }
    },
    created() {
      this.$nextTick(() => {
        this.requestMain()
        if(this.v2) this.requestVice(this.v1)
      })
    },
    methods: {
      requestMain() {
       this.requestAjax('get', this.options[0].url).then(res => {
         if(res.success) {
           this.select1 = this._parseData(res.data.rows)
         }
       })
      },
      requestVice(id){
        let parms = {}
        parms[ this.options[1].parmsId] = id
        this.requestAjax('get', this.options[1].url, parms).then(res => {
          if(res.success) {
            this.select2 = this._parseData(res.data.rows)
            if(v2) this.v2 = v2
          }
        })
      },
      _parseData(data){
        let arr = []
        data.forEach(item => {
          arr.push({value: item.id, label: item.name})
        })
        return arr
      },
      customSelectChange(v , opts){
        if(opts.change) {
          this.$emit('changeExternal', v, opts.change)
        }
      }
    }
  }
</script>

<style scoped>

  .inputForm .ivu-col p{line-height: 30px}
  .red_tip{display: inline-block; width:10px; height: 20px; color: #FF0000;vertical-align: sub;}

</style>
