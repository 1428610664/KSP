import {getUserInfo, getIsLogin, getUserId} from 'common/js/cache'

const state = {
  userId: getUserId(),
  userData: getUserInfo(),
  isLogin: getIsLogin(),
}

export default state
