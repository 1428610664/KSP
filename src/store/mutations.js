import * as types from './mutation-types'

const mutations = {
  [types.SET_USERDATA](state, data) {
    state.userData = data
  },
  [types.SET_ISLOGIN](state, data) {
    state.isLogin = data
  },
  [types.SET_USERID](state, data) {
    state.userId = data
  }
}
export default mutations
