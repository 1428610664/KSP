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
        contactList: '/contact',
        // 客户管理
        customer: 'customer',
        deleteCustomer: `/customer/${id}`,
        customerList: '/customer',
        // 用户管理
        users: '/users',
        deleteUser: `/users/${id}`,
        menusByRoleId: '/users/menusByRoleId',
        // 部门管理
        department: '/department',
        deleteDepartment: `/department/${id}`,
        departmentList: '/department',
        // 角色管理
        roles: '/roles',
        deleteRoles: `/roles/${id}`,
        rolesList: '/roles',
        savaMenus: '/roles/savaMenus',
        // 产品管理
        product: '/product',
        deleteProduct: `/product/${id}`,
        productList: '/product',
        classify: '/product/classify',
        deleteClassify: `/product/classify/${id}`,
        classifyList: '/product/classify',
        // 商业机会
        business: '/business',
        deleteBusiness: `/business/${id}`,
        businessList: '/business',
        // 活动管理
        activity: '/activity',
        deleteActivity: `/activity/${id}`,
        activityList: '/activity',
        // 订单管理
        order: `/orders/${id}`,
        orders: '/orders',
        deleteOrders: `/orders/${id}`,
        ordersList: '/orders',
        // 收款管理
        receipt: '/receipt',
        deleteReceipt: `/receipt/${id}`,
        receiptList: '/receipt'
      }
      return urlJson[name]
    }
  }
}
