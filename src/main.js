import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import config from '../config'

import axios from 'axios'
import VueLazyload from 'vue-lazyload'
import Scrollbar from 'smooth-scrollbar'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import iView from 'iview'
import './theme/iview/index.less'
import Api from 'api/Api'
import publicUtils from 'common/js/publicUtils'
import InitScroll from 'common/js/initScroll'
import 'vue-tree-halower/dist/halower-tree.min.css' // you can customize the style of the tree
import VTree from 'vue-tree-halower'
import 'common/js/common'

Vue.prototype.axios = axios
Vue.prototype.Scrollbar = Scrollbar
Vue.config.productionTip = false

Vue.use(iView)
Vue.use(VTree)
Vue.use(Api)
Vue.use(publicUtils)
Vue.use(InitScroll)

axios.defaults.baseURL = 'https://pmp.coreware.cn:8445/ksp'

// 懒加载图片
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: require('./common/images/loading.png'),
  loading: require('./common/images/loading1.gif'),
  attempt: 1
})

// 加载条
NProgress.configure({ showSpinner: false })
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})
router.afterEach(() => {
  NProgress.done()
})

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

let urlWdatePicker = process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
document.write('<script type="text/javascript" src="' + urlWdatePicker + 'static/My97DatePicker/WdatePicker.js"></script>')
urlWdatePicker = null
