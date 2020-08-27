import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

/**
 * 这里我们还用到了 sessionStorage，即session存储，在项目打开的时候会判断session中是否有 user 这个对象存在，
 * 如果存在就取出来并获得 username 的值，否则则把 username 设置为空。
 * 【localStorage 本地存储，只要不清楚缓存，会一直处于登录状态】  这里使用sessionStorage
 */

export default new Vuex.Store({
  state: {
    user: {
      username: window.sessionStorage.getItem('user' || '[]') == null ? '' : JSON.parse(window.sessionStorage.getItem('user' || '[]')).username
    }
  },
  mutations: {
    login (state, user) {
      state.user = user
      window.sessionStorage.setItem('user', JSON.stringify(user))
    }
  }
})
