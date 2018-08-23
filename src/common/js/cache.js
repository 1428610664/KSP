import storage from 'good-storage'
const USER_INFO = '__userInfo__'
const IS_LOGIN = '__isLogin__'
const MEMBER_ID = '__memberId__'
const USER_ID = '__userId__'

export function setUserInfo (val) {
  storage.set(USER_INFO, val)
}

export function getUserInfo () {
  return storage.get(USER_INFO, null)
}

export function setIsLogin (val) {
  storage.set(IS_LOGIN, val)
}

export function getIsLogin () {
  return storage.get(IS_LOGIN, {})
}

export function setUserId (val) {
  storage.set(USER_ID, val)
}

export function getUserId () {
  return storage.get(USER_ID, '')
}
