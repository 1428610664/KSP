import store from 'store'
import {setIsLogin, setUserInfo} from 'common/js/cache'

export default {
  install(Vue, options) {
    Vue.directive("drag", function (el) {
      el.onmousedown = function (e) {
        var _left = e.clientX - el.offsetLeft, _top = e.clientY - el.offsetTop
        var maxW = window.innerWidth - el.offsetWidth, maxH = window.innerHeight - el.offsetHeight
        document.onmousemove = function (e) {
          var l = e.clientX - _left, t = e.clientY - _top
          if (l <= 0) l = 0
          if (t <= 0) t = 0
          if (l >= maxW) l = maxW
          if (t >= maxH) t = maxH
          el.style.left = l + "px"
          el.style.top = t + "px"
        }
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        }
      }
    })

    Vue.prototype.commonUrl = 'https://pmp.coreware.cn:8444/mice'

    /**
     * 公用请求方法 以params形式提交参数
     * @param type
     * @param url
     * @param params
     * @param urlId
     * @returns {Promise<any>}
     */
    Vue.prototype.requestAjax = async function(type, url, params, urlId) {
      // 分页开始
      let newParams = {}
      Object.assign(newParams, params)
      // 添加rr时间戳参数值清除缓存用
      if (type != 'post' && type != 'POST') {
        newParams.rr = parseInt(new Date().getTime())
      }
      // 分页计算开始
      if (newParams.offset && newParams.offset > 0) {
        newParams.offset = parseInt(newParams.offset - 1) * newParams.limit
      }
      // 分页计算结束
      return await new Promise((resolve, reject) => {
        this.axios({
          method: type,
          url: this.Api(url, urlId),
          params: newParams,
          xhrFields: {
            withCredentials: true
          },
          headers: {
            // 'memberId': store.state.memberId || '',
            'userId': store.state.userData ? store.state.userData.user.id : '',
            // 'userType': store.state.userData ? store.state.userData.userType : '',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }).then((data) => {
          if (this.isOvertime(data.data)) {
            resolve(data.data)
          }
        }).catch((error) => {
          console.log('error...')
          reject(error)
        })
      })
    }
    /**
     * 公用请求方法以data方式提交参数
     * @param type
     * @param url
     * @param data
     * @param urlId
     * @returns {Promise<any>}
     */
    Vue.prototype.requestFile = function (type, url, data, urlId) {
      return new Promise((resolve, reject) => {
        this.axios({
          method: type,
          url: this.getWbkUrl(url, urlId),
          data: data,
          withCredentials: true,
          headers: {
            'memberId': store.state.memberId,
            'userId': store.state.userData ? store.state.userData.userId : '',
            'userType': store.state.userData ? store.state.userData.userType : ''
          }
        }).then((data) => {
          if (this.isOvertime(data.data)) {
            resolve(data.data)
          }
        }).catch((error) => {
          console.log('error...')
          reject(error)
        })
      })
    }
    /**
     * 超出部分隐藏
     * @param h
     * @param params
     * @returns {*}
     */
    Vue.prototype.tdRender = function (h, params) {
      return h('div', {
        'class': 'td-render',
        domProps: {
          title: params.row[params.column.key]
        },
        style: {
          cursor: 'pointer'
        }
      }, params.row[params.column.key])
    }

    /**
     * 设置定时器
     * @param func
     * @param delay
     * @returns {Function}
     */
    Vue.prototype.debounce = function (func, delay) {
      let timer
      return function (...args) {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          func.apply(this, args)
        }, delay)
      }
    }
    /**
     * 公用页面跳转
     * @param url
     */
    Vue.prototype.routePush = function (url, id, type, obj) {
      let newParams = {}
      if (obj) {
        Object.assign(newParams, obj)
      }
      if (id) {
        Object.assign(newParams, {id: id})
      }
      if (type) {
        Object.assign(newParams, {type: type})
      }
      this.$router.push({path: url, query: newParams})
    }

    /**
     * 登入超时验证
     * @param data
     * @returns {boolean}
     */
    Vue.prototype.isOvertime = function (data) {
      if (data.data && data.data.TimeOut) {
        store.state.isLogin = false
        setIsLogin(false)
        store.state.userData = null
        setUserInfo(null)
        this.$Message.warning({content: '登录超时, 请重新登录！', duration: 10, closable: true})
        this.routePush('/login', '', '', {oldPath: this.$route.path})
        return false
      } else {
        return true
      }
    }
    /**
     * 创建用户渠道转义
     * @param number
     * @returns {string}
     */
    Vue.prototype.getActiveStatus = function (number) {
      /*    【-2：草稿】【-1：审核不通过】【0：未审核】【1：未开始】【2：执行中】【3：暂停】【99：结束】*/
      switch ('' + number) {
        case '-2':
          return '草稿'
        case '-1':
          return '审核未通过'
        case '0':
          return '待审核'
        case '1':
          return '未开始'
        case '2':
          return '进行中'
        case '3':
          return '已取消'
        case '99':
          return '结束'
        default:
          return number
      }
    }

    Vue.prototype._parseSelectData = (data) => {
      let arr = []
      data.forEach(item => {
        arr.push({value: item.id, label: item.name})
      })
      return arr
    }

    Vue.prototype._parseSelectData2 = (data) => {
      let arr = []
      data.forEach(item => {
        arr.push({value: item.name, label: item.name})
      })
      return arr
    }

    Vue.prototype._parseSelectData3 = (data) => {
      let arr = []
      data.forEach(item => {
        arr.push({value: item.label, label: item.label})
      })
      return arr
    }

    Vue.prototype.requestCommon = function (parmas, cb) {
      this.requestAjax('get', 'common', parmas).then(res => {
        if(cb) cb(res)
      })
    }

    Vue.prototype._parseEnums = (data) => {
      let d = {}
      data.forEach(item => {
        if(!d[item.key]) {
          d[item.key] = []
        }
        d[item.key].push(item)
      })
      return d
    }

    /**
     * 枚举 Key 值
     * @type {{activityMode: string, classify: string, role: string, winRate: string, industry: string, level: string}}
     * @private
     */
    Vue.prototype.__ENUMS_KEY__ = {
      activityMode: 'HDLX',     // 活动方式
      classify: 'KHFL',         // 分类
      role: 'LXRJCGX',          // 决策角色
      winRate: 'JHPERCENT',     // 赢率
      industry: 'KHHY',         // 所属行业
      level: 'LXRGXDJ',         // 关系等级
      payment: 'SKFS',          // 收款方式
    }

  }
}
