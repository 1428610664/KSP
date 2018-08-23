<template>
  <div>
    <Row>
      <i-col span="8">
        <Select v-model="address.city1"   @on-change="provinceChange" placeholder="请选择省" filterable>
          <Option v-for="item in select.province" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </i-col>
      <i-col span="8" style="padding-left: 5px">
        <Select v-model="address.city2" placeholder="请选择市、县" :filterable="false"  @on-change="cityChange">
          <Option v-for="item in select.city" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </i-col>
      <i-col span="8" style="padding-left: 5px">
        <Select v-model="address.city3" placeholder="请选择县、区" :filterable="false">
          <Option v-for="item in select.area" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </i-col>
    </Row>
  </div>
</template>

<script>

  import locationData from 'common/js/address/location'

  export default {
    props: {
      value: ''
    },
    data() {
      const province = []
      let cityObj = {}
      let areaObj = {}
      for (let code in locationData) {
        let item = locationData[code]
        province.push(Object.assign({}, {label: item.name, value: item.name}))
        let cityList = item.cities
        cityObj[item.name] = []
        for (let key in cityList) {
          // console.log(cityList[key])
          cityObj[item.name].push(Object.assign({}, {label: cityList[key].name, value: cityList[key].name}))
          areaObj[cityList[key].name] = []
          for (let _key in cityList[key].districts) {
            // console.log(cityList[key].districts[_key])
            areaObj[cityList[key].name].push(Object.assign({}, {label: cityList[key].districts[_key], value: cityList[key].districts[_key]}))
          }
        }
      }
      return {
        address: {
          city1: '',
          city2: '',
          city3: ''
        },
        city: cityObj,
        areaObj: areaObj,
        select: {
          province: province,
          city: cityObj['广东省'],
          area: areaObj['深圳市']
        },
      }
    },
    methods: {
      provinceChange (val) {
        this.address.city2 = ''
        this.address.city3 = ''
        this.select.city = this.city[val]
        this.select.area = []
      },
      cityChange (val) {
        this.address.city3 = ''
        this.select.area = this.areaObj[val]
      },
    },
    beforeMount() {
      this.$nextTick( () => {
        this.select.city = this.city[this.value.city1]
        this.select.area = this.areaObj[this.value.city2]
        this.address = this.value
      })
    },
    watch: {
      value: {
        handler(val, oldVal){
          this.select.city = this.city[val.city1]
          this.select.area = this.areaObj[val.city2]
          this.address = val
        },
        deep:true
      },
      address: {
        handler(val, oldVal){
          this.$emit('input', this.address)
        },
        deep:true
      }
    }
  }
</script>

<style scoped>

</style>
