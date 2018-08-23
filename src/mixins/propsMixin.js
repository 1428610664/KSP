
export const propsMixin = {
  data(){
    return {
      propsList: [],       // 自定义字段
      propsOpintions: [],  // 自定义字段配置
      propsFromVal: {},    // 自定义字段值
    }
  },
  methods: {
    requestProps(){
      this.requestAjax('get', 'props', {model: this.propsKey}).then(res => {
        if(res.success) {
          this.propsList = res.data.rows
          this.propsOpintions.push(this.addPropsInputs(this.propsList))
          this.propsFromVal = this.addPropsIds(this.propsList)
        }
      })
    },
    addPropsInputs(data){
      let input = []
      data.forEach(item => {
        input.push({title: '#' + item.nameCn,id: item.nameEn,type: 'input',titlespan: 3,colspan: 9,required: false})
      })
      if(input.length > 0) input.unshift({title:'自定义字段',theme: true})
      return input
    },
    addPropsIds(data){
      let ids = {}
      data.forEach(item => {
        ids[ item.nameEn] = ''
      })
      return ids
    },
    _clearPropsFromVal(){
      for (let k in this.propsFromVal){
        this.propsFromVal[k] = ''
      }
    }
  }

}
