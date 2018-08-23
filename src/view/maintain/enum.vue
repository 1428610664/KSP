<template>
  <div class="wrapper b wrapper-box m-10">
    <div class="c3">
      <h3 class="c2 p-10">客户枚举参数</h3>
      <div class="item-wrapper fbox"  v-for="item in enumsList">
        <div class="item-title cr">
          <div>{{item.name}}：</div>
        </div>
        <div class="item-content flex c2" style="font-size: 0px">
          <Tag type="dot" closable color="error" @on-close="closeEvent(row)"  v-for="row in item.childer" :key="row.id">{{row.name}}</Tag>
          <div class="v-tag c3 fz12" @click="addTagEvent(item)"><Icon class="fz18" type="ios-add-circle" style="vertical-align: sub" /> 添加</div>
        </div>
      </div>
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
        enumsList: {},

        inputForm: {
          show: false,
          modalDisabled: false,
          modalshow: false,
          option: {},
          value: {}
        },
      }
    },
    created() {
      this.$nextTick(() => {
        this.reuqustEnumsList()
      })
    },
    methods: {
      closeEvent(item){
        this.deleteEnums(item.id)
      },
      reuqustEnumsList(){
        this.requestAjax('get', 'enumsList', {}).then(res => {
          if(res.success) {
            this.enumsList = this._parseEnumsList(res.data.rows)
          }
        })
      },
      _parseEnumsList(data){
        let lists = {}
        data.forEach(item => {
          if(!lists[item.typeName]) lists[item.typeName] = {id: item.typeId, name: item.typeName, childer: []}
          lists[item.typeName].childer.push(item)
        })
        return lists
      },

      addTagEvent (row) {
        this.inputForm.modalshow = true
        this.inputForm.show = true
        this.inputForm.modalDisabled = false

        let opintions = [
            [{title:'枚举名称',id:'name',type:'input',titlespan:4,colspan:20,required:true}]],
          value = {name: '',typeId: row.id}

        this.inputForm.option = {
          title: '添加'+row.name+'枚举',
          width: '480',
          opintions: opintions,
          button: [{
            type: 'primary',
            title: '确认',
            click: 'handle'
          }]
        }
        this.inputForm.value = value
      },
      /**
       *提交返回处理方法
       * @param val
       * @param type
       */
      getInputVal (val, type) {
        this.inputForm.value = val
        if (type === 'cancel') {
          this.inputForm.modalshow = false
          return
        }
        let newVal = {}
        Object.assign(newVal, val)
        this.addEnums(newVal)
      },

      addEnums(data){
        this.requestAjax('post', 'enums', data).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) {
            this.reuqustEnumsList()
            this.inputForm.modalshow = false
          }
        })
      },
      deleteEnums(id){
        this.requestAjax('delete', 'deleteEnums', {}, id).then(res => {
          this.$Message[res.success ? 'success' : 'warning'](res.desc)
          if(res.success) this.reuqustEnumsList()
        })
      },
    },
    components: {
      inputFrom
    }
  }
</script>

<style scoped>

  .item-wrapper{padding: 12px 0;}
  .item-wrapper:nth-child(n+2){border-top: 1px dashed #e8eaec}
  .item-title{ width: 100px;padding-right: 15px; line-height: 32px}

  .v-tag{display: inline-block; border: 1px dashed #e8eaec;line-height: 30px;padding: 0 12px;    cursor: pointer;vertical-align: middle;    border-radius: 3px;margin: 2px 4px 2px 0;}

</style>
