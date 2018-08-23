import * as types from './mutation-types'
import {setIsLogin, setUserInfo} from 'common/js/cache'

export const loginAction = function ({commit, state}, data) {
  commit(types.SET_ISLOGIN, true)
  commit(types.SET_USERDATA, data)
  commit(types.SET_USERID, data.user.id)
  setIsLogin(true)
  setUserInfo(data)
}

export const logoutAction = function ({commit, state}) {
  commit(types.SET_ISLOGIN, false)
  commit(types.SET_USERDATA, null)
  commit(types.SET_USERID, '')
  setIsLogin(false)
  setUserInfo(null)
}
