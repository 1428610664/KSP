
export const propsMixin = {
  data(){
    return {
      propsList: [],       // 自定义字段
      propsOpintions: [],  // 自定义字段配置
      propsFromVal: {},    // 自定义字段值

      changeColumns: [],
    }
  },
  methods: {
    requestProps(){
      this.requestAjax('get', 'props', {model: this.propsKey}).then(res => {
        if(res.success) {
          this.propsList = res.data.rows
          this._parseCustomProps(res.data.rows)
          // this.columns = this.columns.concat(this._parseCustomProps(res.data.rows))
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
    },
    _setPropsVal(data){
      for(let k in data){
        this.propsFromVal[k] = data[k]
      }
    },
    _parseCustomProps(data){
      let arr = []
      data.forEach(item => {
        this.columns.splice(this.columns.length-1, 0, {title: '#'+item.nameCn, show: false, key: item.nameEn, width: 150, sortable: true, render: (h, params) => {
          let propsVal = null
          if(params.row.propsVal) {
            propsVal = JSON.parse(params.row.propsVal)
          }
          return h('div', [
            h('span', propsVal ? propsVal[item.nameEn] : '')
          ])
        }})
      })
      return arr
    },

    columnsChange (val) {
      for (let key in this.columns) {
        this.columns[key].show = false
      }
      this.changeColumns = []
      for (let key of val) {
        this.columns[key].show = true
        this.changeColumns.push(Object.assign({}, this.columns[key]))
      }
    },
  }

}
