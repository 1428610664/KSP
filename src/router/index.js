import Vue from 'vue'
import Router from 'vue-router'
import config from '../../config'

Vue.use(Router)

export default new Router({
  base: process.env.NODE_ENV === 'production'
    ? config.build.assetsPublicPath
    : config.dev.assetsPublicPath,
  mode: 'history',
  routes: [
    { path: '/', redirect: '/index'},
    { path: '*', component: (resolve) => require(['../components/404'], resolve) },
    {
      name: '用户登录',
      path: '/login',
      component: (resolve) => require(['../view/login'], resolve)
    },
    {
      name: '首页',
      path: '/index',
      component: (resolve) => require(['../view/index'], resolve),
      children: [
        {
          name: '季度统计',
          path: '/quarter',
          component: (resolve) => require(['../view/statistics/quarter'], resolve),
        },
        {
          name: '客户管理',
          path: '/customerManage',
          component: (resolve) => require(['../view/customer/manage'], resolve),
        },
        {
          name: '联系人管理',
          path: '/contactManage',
          component: (resolve) => require(['../view/customer/contact'], resolve),
        },
        {
          name: '商业机会管理',
          path: '/businessManage',
          component: (resolve) => require(['../view/business/manage'], resolve),
        },
        {
          name: '商业机会日历',
          path: '/businessCalendar',
          component: (resolve) => require(['../view/business/calendar'], resolve),
        },
        {
          name: '活动管理',
          path: '/activityManage',
          component: (resolve) => require(['../view/activity/manage'], resolve),
        },
        {
          name: '活动日历',
          path: '/activityCalendar',
          component: (resolve) => require(['../view/activity/calendar'], resolve),
        },
        {
          name: '订单管理',
          path: '/orderManege',
          component: (resolve) => require(['../view/finance/order'], resolve),
        },
        {
          name: '收款管理',
          path: '/gatheringManege',
          component: (resolve) => require(['../view/finance/gathering'], resolve),
        },
        {
          name: '系统参数设置',
          path: '/systemSetup',
          component: (resolve) => require(['../view/maintain/system-setup'], resolve),
        },
        {
          name: '枚举参数',
          path: '/enum',
          component: (resolve) => require(['../view/maintain/enum'], resolve),
        },
        {
          name: '产品管理',
          path: '/productManage',
          component: (resolve) => require(['../view/maintain/product'], resolve),
        },
        {
          name: '销售任务',
          path: '/salesTask',
          component: (resolve) => require(['../view/maintain/sales-task'], resolve),
        },
        {
          name: '用户管理',
          path: '/userManage',
          component: (resolve) => require(['../view/power/user-manage'], resolve),
        },
        {
          name: '组织结构',
          path: '/organizationStructure',
          component: (resolve) => require(['../view/power/organization-structure'], resolve),
        },
        {
          name: '角色管理',
          path: '/roleManage',
          component: (resolve) => require(['../view/power/role-manage'], resolve),
        },
        {
          name: '用户权限',
          path: '/userPermission',
          component: (resolve) => require(['../view/power/user-permission'], resolve),
        },
        {
          name: '自定义字段',
          path: '/custom',
          component: (resolve) => require(['../view/custom'], resolve),
          children: [
            {
              name: '客户管理',
              path: 'customer',
              component: (resolve) => require(['../view/custom/custom'], resolve)
            },
            {
              name: '联系人管理',
              path: 'contact',
              component: (resolve) => require(['../view/custom/custom'], resolve)
            },
            {
              name: '活动管理',
              path: 'activity',
              component: (resolve) => require(['../view/custom/custom'], resolve)
            },
            {
              name: '商业管理',
              path: 'business',
              component: (resolve) => require(['../view/custom/custom'], resolve)
            },
          ]
        },
        {
          name: '测试页面',
          path: '/test',
          component: (resolve) => require(['../view/test'], resolve),
        }
      ]
    }
  ]
})
