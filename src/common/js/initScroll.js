export default{
  install (Vue, options) {
    /**
     * 滚动初始化
     */
    Vue.prototype.initScroll = function (damo, table) {
      if (damo != null && damo.length !== 0) {
        for (let i = 0; i < damo.length; i++) {
          this.Scrollbar.destroy(damo[i])
          let scrollbar = this.Scrollbar.init(damo[i], {alwaysShowTracks: true, continuousScrolling: true})
          if (table) {
            let srollLeft = {offset: {x: 0, y: 0}}
            scrollbar.addListener((status) => {
                if (srollLeft.offset.x !== status.offset.x && srollLeft.offset.y === status.offset.y) {
                  damo[i].previousElementSibling.scrollTo(status.offset.x, 0)
                }
                srollLeft = status
            })
             }
           }
      }
    }
    /**
     * table滚动
     */
    Vue.prototype.initTableScroll = function () {
      this.initScroll(document.querySelectorAll('.ivu-table .ivu-table-body'), true)
    }
    /**
     * 模态下拉
     */
    Vue.prototype.initModalSelectScroll = function () {
      this.initScroll(document.querySelectorAll('.inputForm .ivu-select-dropdown'))
    }
    /**
     * 模态遮罩层滚动
     */
    Vue.prototype.initModalScroll = function () {
      this.initScroll(document.querySelectorAll('.ivu-modal-wrap'))
    }
    /**
     *简单页面（未使用框架）滚动（传id或class）；
     * 例： this.initDamoScrollAll("#id.class")
     */
    Vue.prototype.initDamoScrollAll = function (c) {
      this.initScroll(document.querySelectorAll(c))
    }
    /**
    *删除所有框架滚动
   */
    Vue.prototype.destroyALLScroll = function () {
      this.Scrollbar.destroyAll()
    }
    /**
    * 所有滚动初始化
    */
    Vue.prototype.initAllScroll = function () {
      this.initTableScroll()
    }
    /**
    * 所有有左侧菜单页面滚动初始化
    */
    Vue.prototype.initAllTableScroll = function () {
      this.initModalSelectScroll()
      this.initModalScroll()
      this.initTableScroll()
    }
    /**
     * 所有没有左侧菜单滚动条初始化
     */
    Vue.prototype.initAllScrollNoMenu = function () {
      this.initModalSelectScroll()
      this.initTableScroll()
    }
  }
}
