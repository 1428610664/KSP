export default {
  install (Vue, options) {
    Vue.prototype.Api = function (name, id) {
      const urlJson = {
        // 基础接口
        login: '/users/login',
        updatePwd: '/users/updatePwd',
        common: '/users/init',
        // 自定义属性
        props: '/props',
        deleteProps: `/props/${id}`,
        // 枚举
        enums: '/enums',
        deleteEnums: `/enums/${id}`,
        enumsList: '/enums/queryList',
        // 菜单管理
        menus: '/menus',
        menusList: '/menus/queryList',
        // 联系人管理
        contact: 'contact',
        deleteContact: `/contact/${id}`,
        contactList: '/contact/queryList',
        // 客户管理
        customer: 'customer',
        deleteCustomer: `/customer/${id}`,
        customerList: '/customer/queryList',
        // 用户管理
        users: '/users',
        deleteUser: `/users/${id}`,
        menusByRoleId: '/users/menusByRoleId',
        // 部门管理
        department: '/department',
        deleteDepartment: `/department/${id}`,
        departmentList: '/department/queryList',
        // 角色管理
        roles: '/roles',
        deleteRoles: `/roles/${id}`,
        rolesList: '/roles/queryList',
        savaMenus: '/roles/savaMenus',
        // 产品管理
        product: '/product',
        deleteProduct: `/product/${id}`,
        productList: '/product/queryList',
        classify: '/product/classify',
        deleteClassify: `/product/classify/${id}`,
        classifyList: '/product/classify',
        // 商业机会
        business: '/business',
        deleteBusiness: `/business/${id}`,
        businessList: '/business/queryList',
        // 活动管理
        activity: '/activity',
        deleteActivity: `/activity/${id}`,
        activityList: '/activity/queryList',
        // 订单管理
        order: `/orders/${id}`,
        orders: '/orders',
        deleteOrders: `/orders/${id}`,
        ordersList: '/orders/queryList',
        // 收款管理
        receipt: '/receipt',
        deleteReceipt: `/receipt/${id}`,
        receiptList: '/receipt/queryList',
        // 销售任务
        salesTask: '/salesTask',
        deleteSalesTask: `/salesTask/${id}`,
      }
      return urlJson[name]
    }
  }
}
